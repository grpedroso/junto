import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Notifications from 'expo-notifications';

const CHANNEL = 'ema';
const LOG_KEY = 'spike:log';
const SEEN_KEY = 'spike:seen';
const TIMES = [
  { hour: 11, minute: 0 },
  { hour: 17, minute: 0 },
  { hour: 21, minute: 0 },
];

const JITTER_MINUTES = 30;
const SCHEDULED_DAYS = 21;

/**
 * Copy of `withJitter` from the app's src/domain/ema.ts. The spike is a separate
 * Expo project and cannot import from it, and a probe that schedules something
 * other than what the product schedules measures the wrong thing.
 */
const withJitter = ({ hour, minute }: { hour: number; minute: number }) => {
  const offset = Math.round((Math.random() * 2 - 1) * JITTER_MINUTES);
  const total = (hour * 60 + minute + offset + 1440) % 1440;
  return { hour: Math.floor(total / 60), minute: total % 60 };
};

type Event = {
  ts: number;
  kind: 'scheduled' | 'tray' | 'received' | 'tapped';
  text: string;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const stamp = (ts: number) =>
  new Date(ts).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });

const day = (ts: number) => new Date(ts).toLocaleDateString('pt-BR');

export default function App() {
  const [permission, setPermission] = useState('checking...');
  const [scheduled, setScheduled] = useState(0);
  const [log, setLog] = useState<Event[]>([]);
  const subs = useRef<Notifications.EventSubscription[]>([]);

  const record = useCallback(async (kind: Event['kind'], text: string) => {
    const raw = await AsyncStorage.getItem(LOG_KEY);
    const current: Event[] = raw ? JSON.parse(raw) : [];
    const next = [{ ts: Date.now(), kind, text }, ...current].slice(0, 300);
    await AsyncStorage.setItem(LOG_KEY, JSON.stringify(next));
    setLog(next);
  }, []);

  // The device may deliver with the app dead -- no listener runs. The tray is
  // the only proof that survives: whatever is still there was truly delivered.
  const sweepTray = useCallback(async () => {
    const inTray = await Notifications.getPresentedNotificationsAsync();
    const raw = await AsyncStorage.getItem(SEEN_KEY);
    const seen: string[] = raw ? JSON.parse(raw) : [];
    const fresh = inTray.filter((n) => !seen.includes(n.request.identifier + ':' + n.date));
    for (const n of fresh) {
      await record(
        'tray',
        'delivered ' + stamp(n.date) + ' -- ' + (n.request.content.title ?? 'no title')
      );
    }
    if (fresh.length) {
      const all = [
        ...seen,
        ...fresh.map((n) => n.request.identifier + ':' + n.date),
      ].slice(-500);
      await AsyncStorage.setItem(SEEN_KEY, JSON.stringify(all));
    }
    return fresh.length;
  }, [record]);

  const refreshScheduled = useCallback(async () => {
    const list = await Notifications.getAllScheduledNotificationsAsync();
    setScheduled(list.length);
  }, []);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(LOG_KEY);
      if (raw) setLog(JSON.parse(raw));

      if (!Device.isDevice) {
        setPermission('EMULATOR -- the test does not count');
        return;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(CHANNEL, {
          name: 'Avaliacoes',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
          sound: 'default',
        });
      }

      const current = await Notifications.getPermissionsAsync();
      const final = current.granted ? current : await Notifications.requestPermissionsAsync();
      setPermission(final.granted ? 'granted' : 'denied (' + final.status + ')');

      await sweepTray();
      await refreshScheduled();
    })();

    subs.current = [
      Notifications.addNotificationReceivedListener((n) =>
        record('received', 'app open -- ' + n.request.content.title)
      ),
      Notifications.addNotificationResponseReceivedListener((r) =>
        record('tapped', String(r.notification.request.content.title))
      ),
    ];
    const current = subs.current;
    return () => current.forEach((s) => s.remove());
  }, [record, sweepTray, refreshScheduled]);

  /**
   * Mirrors `scheduleEmas` in the app: one-shot DATE alarms, 21 days ahead, each
   * with +-30 min of jitter. Android's DAILY trigger is a fixed hour, so the
   * product cannot use it -- and a spike that used it would be measuring a
   * different native path than the one that ships.
   */
  const scheduleWindow = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const now = new Date();
    let count = 0;

    for (let d = 0; d < SCHEDULED_DAYS; d++) {
      for (const base of TIMES) {
        const { hour, minute } = withJitter(base);
        const when = new Date(now);
        when.setDate(when.getDate() + d);
        when.setHours(hour, minute, 0, 0);
        if (when <= now) continue;

        await Notifications.scheduleNotificationAsync({
          identifier: 'ema:' + when.toISOString(),
          content: {
            title: 'E ai, como ta?',
            body: '20 segundos, 6 perguntas.',
            sound: 'default',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: when,
            channelId: CHANNEL,
          },
        });
        count++;
      }
    }

    await refreshScheduled();
    await record('scheduled', count + ' one-shot alarms over ' + SCHEDULED_DAYS + ' days');
  };

  const scheduleTest = async () => {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'One minute test', body: 'If this arrived, the channel works.' },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 60,
        channelId: CHANNEL,
      },
    });
    await refreshScheduled();
    await record('scheduled', 'test in 60s');
  };

  const check = async () => {
    const n = await sweepTray();
    await refreshScheduled();
    Alert.alert('Tray', n ? n + ' new delivery(ies) recorded.' : 'Nothing new in the tray.');
  };

  const openBattery = async () => {
    if (Platform.OS !== 'android') return;
    await IntentLauncher.startActivityAsync(
      'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS'
    );
  };

  const clear = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.multiRemove([LOG_KEY, SEEN_KEY]);
    setLog([]);
    await refreshScheduled();
  };

  const deliveries = log.filter((e) => e.kind === 'tray');
  const perDay = deliveries.reduce<Record<string, number>>((acc, e) => {
    acc[day(e.ts)] = (acc[day(e.ts)] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <View style={s.screen}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>Notification spike</Text>
        <Text style={s.subtitle}>
          {Device.manufacturer ?? '?'} {Device.modelName ?? ''} - Android {Device.osVersion ?? '?'}
        </Text>

        <View style={s.card}>
          <Row label="Permission" value={permission} />
          <Row label="Scheduled" value={String(scheduled)} />
          <Row label="Deliveries recorded" value={String(deliveries.length)} />
        </View>

        <View style={s.card}>
          <Text style={s.blockLabel}>Deliveries per day (target: 3/day)</Text>
          {Object.keys(perDay).length === 0 ? (
            <Text style={s.empty}>nothing yet</Text>
          ) : (
            Object.entries(perDay).map(([d, n]) => <Row key={d} label={d} value={n + '/3'} />)
          )}
        </View>

        <Button title="Schedule 21 days (3/day, +-30 min)" onPress={scheduleWindow} />
        <Button title="Test in 1 minute" onPress={scheduleTest} />
        <Button title="Check the tray now" onPress={check} />
        <Button title="Open battery optimisation" onPress={openBattery} />
        <Button title="Clear everything" onPress={clear} destructive />

        <Text style={s.blockLabel}>Log</Text>
        {log.length === 0 && <Text style={s.empty}>empty</Text>}
        {log.map((e, i) => (
          <Text key={e.ts + '-' + i} style={s.logLine}>
            {stamp(e.ts)} [{e.kind}] {e.text}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={s.row}>
    <Text style={s.label}>{label}</Text>
    <Text style={s.value}>{value}</Text>
  </View>
);

const Button = ({
  title,
  onPress,
  destructive,
}: {
  title: string;
  onPress: () => void;
  destructive?: boolean;
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      s.button,
      destructive && s.buttonDestructive,
      pressed && s.buttonPressed,
    ]}
  >
    <Text style={s.buttonText}>{title}</Text>
  </Pressable>
);

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0F1A17' },
  content: { padding: 20, paddingTop: 60, gap: 10 },
  title: { color: '#F2F5F4', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#8FA39D', fontSize: 13, marginBottom: 8 },
  card: { backgroundColor: '#17251F', borderRadius: 12, padding: 14, gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: '#8FA39D', fontSize: 14 },
  value: { color: '#F2F5F4', fontSize: 14, fontWeight: '600' },
  blockLabel: { color: '#8FA39D', fontSize: 13, marginTop: 12, marginBottom: 4 },
  empty: { color: '#5C6E68', fontSize: 13, fontStyle: 'italic' },
  button: { backgroundColor: '#1F6F5C', borderRadius: 10, padding: 14, marginTop: 4 },
  buttonDestructive: { backgroundColor: '#3A2A2A' },
  buttonPressed: { opacity: 0.7 },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '600' },
  logLine: { color: '#A8BAB4', fontSize: 11, fontFamily: 'monospace' },
});
