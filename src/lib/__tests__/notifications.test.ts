import { agendarEmas, DIAS_AGENDADOS } from '../notifications';
import { HORARIOS_PADRAO, JITTER_MINUTOS } from '@/domain/ema';

const agendadas: { identifier: string; date: Date }[] = [];

jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: { DATE: 'date', TIME_INTERVAL: 'timeInterval', DAILY: 'daily' },
  AndroidImportance: { HIGH: 4, DEFAULT: 3, MAX: 5 },
  AndroidNotificationVisibility: { PRIVATE: 0, PUBLIC: 1 },
  setNotificationChannelAsync: jest.fn(async () => undefined),
  getAllScheduledNotificationsAsync: jest.fn(async () => []),
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  scheduleNotificationAsync: jest.fn(async (req: { identifier: string; trigger: { date: Date } }) => {
    agendadas.push({ identifier: req.identifier, date: req.trigger.date });
    return req.identifier;
  }),
}));

beforeEach(() => {
  agendadas.length = 0;
});

const meiaNoite = new Date('2026-08-23T00:05:00');

describe('agendarEmas', () => {
  it('agenda tres por dia pela janela inteira', async () => {
    const n = await agendarEmas(HORARIOS_PADRAO, DIAS_AGENDADOS, meiaNoite);
    expect(n).toBe(DIAS_AGENDADOS * HORARIOS_PADRAO.length);
    expect(agendadas).toHaveLength(n);
  });

  it('marca todas com prefixo proprio, para poder cancelar so as EMAs', async () => {
    await agendarEmas(HORARIOS_PADRAO, 2, meiaNoite);
    expect(agendadas.every((a) => a.identifier.startsWith('ema:'))).toBe(true);
  });

  it('nao agenda no passado', async () => {
    const tardeDaNoite = new Date('2026-08-23T22:00:00');
    await agendarEmas(HORARIOS_PADRAO, 1, tardeDaNoite);
    // 11h, 17h e 21h ja passaram (o jitter chega no maximo a 21h30)
    expect(agendadas).toHaveLength(0);
  });

  it('pula so os horarios ja vencidos do primeiro dia', async () => {
    const meioDia = new Date('2026-08-23T12:00:00');
    const n = await agendarEmas(HORARIOS_PADRAO, 2, meioDia);
    expect(n).toBe(5); // dia 1 perde as 11h; dia 2 completo
    expect(agendadas.every((a) => a.date > meioDia)).toBe(true);
  });

  it('respeita a janela de jitter em torno de cada horario base', async () => {
    await agendarEmas(HORARIOS_PADRAO, 5, meiaNoite);
    for (const { date } of agendadas) {
      const minutos = date.getHours() * 60 + date.getMinutes();
      const perto = HORARIOS_PADRAO.some(
        (h) => Math.abs(minutos - (h.hora * 60 + h.minuto)) <= JITTER_MINUTOS
      );
      expect(perto).toBe(true);
    }
  });

  it('avanca uma data por dia, sem repetir identificador', async () => {
    await agendarEmas(HORARIOS_PADRAO, 7, meiaNoite);
    const ids = agendadas.map((a) => a.identifier);
    expect(new Set(ids).size).toBe(ids.length);

    const dias = new Set(agendadas.map((a) => a.date.toDateString()));
    expect(dias.size).toBe(7);
  });

  it('atravessa a virada do mes sem tropecar', async () => {
    const fimDoMes = new Date('2026-08-30T00:05:00');
    await agendarEmas(HORARIOS_PADRAO, 5, fimDoMes);
    const meses = new Set(agendadas.map((a) => a.date.getMonth()));
    expect(meses.size).toBe(2);
  });
});
