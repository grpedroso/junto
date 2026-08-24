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

const CANAL = 'ema';
const CHAVE_LOG = 'spike:log';
const CHAVE_VISTAS = 'spike:vistas';
const HORARIOS = [
  { hora: 11, minuto: 0 },
  { hora: 17, minuto: 0 },
  { hora: 21, minuto: 0 },
];

type Evento = {
  ts: number;
  tipo: 'agendou' | 'bandeja' | 'recebida' | 'tocou';
  texto: string;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const carimbo = (ts: number) =>
  new Date(ts).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });

const dia = (ts: number) => new Date(ts).toLocaleDateString('pt-BR');

export default function App() {
  const [permissao, setPermissao] = useState('conferindo...');
  const [agendadas, setAgendadas] = useState(0);
  const [log, setLog] = useState<Evento[]>([]);
  const subs = useRef<Notifications.EventSubscription[]>([]);

  const registrar = useCallback(async (tipo: Evento['tipo'], texto: string) => {
    const bruto = await AsyncStorage.getItem(CHAVE_LOG);
    const atual: Evento[] = bruto ? JSON.parse(bruto) : [];
    const novo = [{ ts: Date.now(), tipo, texto }, ...atual].slice(0, 300);
    await AsyncStorage.setItem(CHAVE_LOG, JSON.stringify(novo));
    setLog(novo);
  }, []);

  // O aparelho pode entregar com o app morto -- nenhum listener roda. A bandeja
  // e a unica prova que sobrevive: o que ainda esta la foi entregue de fato.
  const varrerBandeja = useCallback(async () => {
    const naBandeja = await Notifications.getPresentedNotificationsAsync();
    const bruto = await AsyncStorage.getItem(CHAVE_VISTAS);
    const vistas: string[] = bruto ? JSON.parse(bruto) : [];
    const novas = naBandeja.filter(
      (n) => !vistas.includes(n.request.identifier + ':' + n.date)
    );
    for (const n of novas) {
      await registrar(
        'bandeja',
        'entregue ' + carimbo(n.date) + ' -- ' + (n.request.content.title ?? 'sem titulo')
      );
    }
    if (novas.length) {
      const todas = [
        ...vistas,
        ...novas.map((n) => n.request.identifier + ':' + n.date),
      ].slice(-500);
      await AsyncStorage.setItem(CHAVE_VISTAS, JSON.stringify(todas));
    }
    return novas.length;
  }, [registrar]);

  const atualizarAgendadas = useCallback(async () => {
    const lista = await Notifications.getAllScheduledNotificationsAsync();
    setAgendadas(lista.length);
  }, []);

  useEffect(() => {
    (async () => {
      const bruto = await AsyncStorage.getItem(CHAVE_LOG);
      if (bruto) setLog(JSON.parse(bruto));

      if (!Device.isDevice) {
        setPermissao('EMULADOR -- o teste nao vale');
        return;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(CANAL, {
          name: 'Avaliacoes',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          sound: 'default',
        });
      }

      const atual = await Notifications.getPermissionsAsync();
      const final = atual.granted ? atual : await Notifications.requestPermissionsAsync();
      setPermissao(final.granted ? 'concedida' : 'negada (' + final.status + ')');

      await varrerBandeja();
      await atualizarAgendadas();
    })();

    subs.current = [
      Notifications.addNotificationReceivedListener((n) =>
        registrar('recebida', 'app aberto -- ' + n.request.content.title)
      ),
      Notifications.addNotificationResponseReceivedListener((r) =>
        registrar('tocou', String(r.notification.request.content.title))
      ),
    ];
    const atuais = subs.current;
    return () => atuais.forEach((s) => s.remove());
  }, [registrar, varrerBandeja, atualizarAgendadas]);

  const agendarDiarias = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    for (const { hora, minuto } of HORARIOS) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'E ai, como ta?',
          body: '20 segundos, 6 perguntas.',
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hora,
          minute: minuto,
          channelId: CANAL,
        },
      });
    }
    await atualizarAgendadas();
    await registrar('agendou', '3 diarias em 11h, 17h, 21h');
  };

  const agendarTeste = async () => {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Teste de 1 minuto', body: 'Se chegou, o canal funciona.' },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 60,
        channelId: CANAL,
      },
    });
    await atualizarAgendadas();
    await registrar('agendou', 'teste em 60s');
  };

  const conferir = async () => {
    const n = await varrerBandeja();
    await atualizarAgendadas();
    Alert.alert('Bandeja', n ? n + ' entrega(s) nova(s) registrada(s).' : 'Nada novo na bandeja.');
  };

  const abrirBateria = async () => {
    if (Platform.OS !== 'android') return;
    await IntentLauncher.startActivityAsync(
      'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS'
    );
  };

  const limpar = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.multiRemove([CHAVE_LOG, CHAVE_VISTAS]);
    setLog([]);
    await atualizarAgendadas();
  };

  const entregas = log.filter((e) => e.tipo === 'bandeja');
  const porDia = entregas.reduce<Record<string, number>>((acc, e) => {
    acc[dia(e.ts)] = (acc[dia(e.ts)] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <View style={s.tela}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={s.conteudo}>
        <Text style={s.titulo}>Spike de notificacoes</Text>
        <Text style={s.sub}>
          {Device.manufacturer ?? '?'} {Device.modelName ?? ''} - Android {Device.osVersion ?? '?'}
        </Text>

        <View style={s.cartao}>
          <Linha rotulo="Permissao" valor={permissao} />
          <Linha rotulo="Agendadas" valor={String(agendadas)} />
          <Linha rotulo="Entregas registradas" valor={String(entregas.length)} />
        </View>

        <View style={s.cartao}>
          <Text style={s.rotuloBloco}>Entregas por dia (meta: 3/dia)</Text>
          {Object.keys(porDia).length === 0 ? (
            <Text style={s.vazio}>nada ainda</Text>
          ) : (
            Object.entries(porDia).map(([d, n]) => (
              <Linha key={d} rotulo={d} valor={n + '/3'} />
            ))
          )}
        </View>

        <Botao titulo="Agendar 3 diarias (11h / 17h / 21h)" onPress={agendarDiarias} />
        <Botao titulo="Teste em 1 minuto" onPress={agendarTeste} />
        <Botao titulo="Conferir bandeja agora" onPress={conferir} />
        <Botao titulo="Abrir otimizacao de bateria" onPress={abrirBateria} />
        <Botao titulo="Limpar tudo" onPress={limpar} destrutivo />

        <Text style={s.rotuloBloco}>Log</Text>
        {log.length === 0 && <Text style={s.vazio}>vazio</Text>}
        {log.map((e, i) => (
          <Text key={e.ts + '-' + i} style={s.linhaLog}>
            {carimbo(e.ts)} [{e.tipo}] {e.texto}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const Linha = ({ rotulo, valor }: { rotulo: string; valor: string }) => (
  <View style={s.linha}>
    <Text style={s.rotulo}>{rotulo}</Text>
    <Text style={s.valor}>{valor}</Text>
  </View>
);

const Botao = ({
  titulo,
  onPress,
  destrutivo,
}: {
  titulo: string;
  onPress: () => void;
  destrutivo?: boolean;
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      s.botao,
      destrutivo && s.botaoDestrutivo,
      pressed && s.botaoPressionado,
    ]}
  >
    <Text style={s.textoBotao}>{titulo}</Text>
  </Pressable>
);

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#0F1A17' },
  conteudo: { padding: 20, paddingTop: 60, gap: 10 },
  titulo: { color: '#F2F5F4', fontSize: 22, fontWeight: '700' },
  sub: { color: '#8FA39D', fontSize: 13, marginBottom: 8 },
  cartao: { backgroundColor: '#17251F', borderRadius: 12, padding: 14, gap: 6 },
  linha: { flexDirection: 'row', justifyContent: 'space-between' },
  rotulo: { color: '#8FA39D', fontSize: 14 },
  valor: { color: '#F2F5F4', fontSize: 14, fontWeight: '600' },
  rotuloBloco: { color: '#8FA39D', fontSize: 13, marginTop: 12, marginBottom: 4 },
  vazio: { color: '#5C6E68', fontSize: 13, fontStyle: 'italic' },
  botao: { backgroundColor: '#1F6F5C', borderRadius: 10, padding: 14, marginTop: 4 },
  botaoDestrutivo: { backgroundColor: '#3A2A2A' },
  botaoPressionado: { opacity: 0.7 },
  textoBotao: { color: '#FFFFFF', textAlign: 'center', fontWeight: '600' },
  linhaLog: { color: '#A8BAB4', fontSize: 11, fontFamily: 'monospace' },
});
