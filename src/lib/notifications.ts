import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { comJitter, HORARIOS_PADRAO, type Horario } from '@/domain/ema';
import { t } from '@/i18n';

export const CANAL_EMA = 'ema';
export const CANAL_FOLLOWUP = 'followup';

/**
 * Quantos dias de EMA ficam agendados por vez.
 *
 * O jitter de +-30min exige data concreta -- o gatilho diario do Android e
 * hora fixa, sem variacao. O preco e que o agendamento acaba se o app nunca
 * mais for aberto. 21 dias significa ignorar 63 notificacoes seguidas antes de
 * o app emudecer; quem responde qualquer uma delas renova a janela inteira.
 *
 * Conferir com o resultado da Fase 0 antes de mexer -- ver NOTIFICATIONS.md.
 */
export const DIAS_AGENDADOS = 21;

const MINUTOS_FOLLOWUP = 30;

export async function prepararCanais() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(CANAL_EMA, {
    name: 'Avaliações',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync(CANAL_FOLLOWUP, {
    name: 'Follow-up',
    importance: Notifications.AndroidImportance.DEFAULT,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
  });
}

export async function pedirPermissao(): Promise<boolean> {
  const atual = await Notifications.getPermissionsAsync();
  if (atual.granted) return true;
  const pedida = await Notifications.requestPermissionsAsync();
  return pedida.granted;
}

/**
 * Reagenda a janela inteira. Cancelar antes evita duplicata quando o app e
 * aberto varias vezes no mesmo dia.
 */
export async function agendarEmas(
  horarios: readonly Horario[] = HORARIOS_PADRAO,
  dias = DIAS_AGENDADOS,
  agora: Date = new Date()
): Promise<number> {
  await cancelarEmas();
  await prepararCanais();

  let agendadas = 0;
  for (let d = 0; d < dias; d++) {
    for (const base of horarios) {
      const { hora, minuto } = comJitter(base);
      const quando = new Date(agora);
      quando.setDate(quando.getDate() + d);
      quando.setHours(hora, minuto, 0, 0);
      if (quando <= agora) continue;

      await Notifications.scheduleNotificationAsync({
        identifier: `ema:${quando.toISOString()}`,
        content: {
          title: t('ema.notificacao_titulo'),
          body: t('ema.notificacao_corpo'),
          data: { tipo: 'ema', agendadaPara: quando.toISOString() },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: quando,
          channelId: CANAL_EMA,
        },
      });
      agendadas++;
    }
  }
  return agendadas;
}

export async function cancelarEmas() {
  const todas = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    todas
      .filter((n) => n.identifier.startsWith('ema:'))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

/** "Conseguiu?" 30 minutos depois da intervencao -- alimenta o ranking dos planos. */
export async function agendarFollowUp(intervencaoId: string) {
  await Notifications.scheduleNotificationAsync({
    identifier: `followup:${intervencaoId}`,
    content: {
      title: t('intervencao.followup_notificacao'),
      data: { tipo: 'followup', intervencaoId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: MINUTOS_FOLLOWUP * 60,
      channelId: CANAL_FOLLOWUP,
    },
  });
}

export async function cancelarFollowUp(intervencaoId: string) {
  await Notifications.cancelScheduledNotificationAsync(`followup:${intervencaoId}`);
}

/** "Responder depois" adia uma hora, uma vez so (secao 6.2). */
export async function adiarUmaHora(agendadaPara: string) {
  await Notifications.scheduleNotificationAsync({
    identifier: `ema:adiada:${agendadaPara}`,
    content: {
      title: t('ema.notificacao_titulo'),
      body: t('ema.notificacao_corpo'),
      data: { tipo: 'ema', agendadaPara, adiada: true },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3600,
      channelId: CANAL_EMA,
    },
  });
}
