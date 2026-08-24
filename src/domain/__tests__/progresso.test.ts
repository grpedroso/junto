import {
  cravingPorSemana,
  diasDesdeUltimaAposta,
  dinheiroNaoGasto,
  semanaIso,
  totalDeDiasSemAposta,
  type EntradaRespondida,
} from '../progresso';
import type { FaixaValor } from '../tipos';

const em = (
  iso: string,
  opcoes: { craving?: number; apostou?: boolean; faixa?: FaixaValor | null } = {}
): EntradaRespondida => ({
  respondidaEm: new Date(iso),
  craving: opcoes.craving ?? 3,
  apostouDesdeUltima: opcoes.apostou ?? false,
  faixaValor: opcoes.faixa ?? null,
});

describe('diasDesdeUltimaAposta', () => {
  it('e nulo sem nenhuma resposta', () => {
    expect(diasDesdeUltimaAposta([])).toBeNull();
  });

  it('conta desde a ultima aposta declarada', () => {
    const entradas = [
      em('2026-08-01T12:00:00', { apostou: true }),
      em('2026-08-10T12:00:00'),
    ];
    expect(diasDesdeUltimaAposta(entradas, new Date('2026-08-13T12:00:00'))).toBe(12);
  });

  it('conta desde o comeco quando nunca houve aposta', () => {
    const entradas = [em('2026-08-01T12:00:00'), em('2026-08-05T12:00:00')];
    expect(diasDesdeUltimaAposta(entradas, new Date('2026-08-08T12:00:00'))).toBe(7);
  });

  it('usa a aposta mais recente, nao a primeira', () => {
    const entradas = [
      em('2026-08-01T12:00:00', { apostou: true }),
      em('2026-08-09T12:00:00', { apostou: true }),
    ];
    expect(diasDesdeUltimaAposta(entradas, new Date('2026-08-12T12:00:00'))).toBe(3);
  });
});

describe('totalDeDiasSemAposta', () => {
  it('conta dias, nao respostas', () => {
    const entradas = [
      em('2026-08-01T11:00:00'),
      em('2026-08-01T17:00:00'),
      em('2026-08-01T21:00:00'),
    ];
    expect(totalDeDiasSemAposta(entradas)).toBe(1);
  });

  it('descarta o dia inteiro se qualquer resposta dele teve aposta', () => {
    const entradas = [
      em('2026-08-01T11:00:00'),
      em('2026-08-01T21:00:00', { apostou: true }),
      em('2026-08-02T11:00:00'),
    ];
    expect(totalDeDiasSemAposta(entradas)).toBe(1);
  });

  it('nao apaga o que veio antes de uma recaida', () => {
    const entradas = [
      em('2026-08-01T11:00:00'),
      em('2026-08-02T11:00:00'),
      em('2026-08-03T11:00:00', { apostou: true }),
      em('2026-08-04T11:00:00'),
    ];
    expect(totalDeDiasSemAposta(entradas)).toBe(3);
    expect(diasDesdeUltimaAposta(entradas, new Date('2026-08-04T11:00:00'))).toBe(1);
  });

  it('nao joga a EMA da noite para o dia seguinte', () => {
    const entradas = [em('2026-08-01T21:30:00'), em('2026-08-01T23:50:00')];
    expect(totalDeDiasSemAposta(entradas)).toBe(1);
  });
});

describe('cravingPorSemana', () => {
  it('agrupa por semana ISO e tira a media', () => {
    const entradas = [
      em('2026-08-17T11:00:00', { craving: 8 }),
      em('2026-08-18T11:00:00', { craving: 6 }),
      em('2026-08-25T11:00:00', { craving: 2 }),
    ];
    const curva = cravingPorSemana(entradas);
    expect(curva).toHaveLength(2);
    expect(curva[0].media).toBe(7);
    expect(curva[0].n).toBe(2);
    expect(curva[1].media).toBe(2);
  });

  it('sai em ordem cronologica mesmo com entrada baguncada', () => {
    const entradas = [em('2026-09-01T11:00:00'), em('2026-08-17T11:00:00')];
    const curva = cravingPorSemana(entradas);
    expect(curva[0].semana < curva[1].semana).toBe(true);
  });
});

describe('semanaIso', () => {
  it('numera a semana no formato ano-Wnn', () => {
    expect(semanaIso(new Date('2026-08-23T12:00:00'))).toMatch(/^\d{4}-W\d{2}$/);
  });

  it('poe segunda e domingo da mesma semana no mesmo balde', () => {
    expect(semanaIso(new Date('2026-08-17T12:00:00'))).toBe(
      semanaIso(new Date('2026-08-23T12:00:00'))
    );
  });

  it('separa domingo do proximo dia, que ja e outra semana', () => {
    expect(semanaIso(new Date('2026-08-23T12:00:00'))).not.toBe(
      semanaIso(new Date('2026-08-24T12:00:00'))
    );
  });
});

describe('dinheiroNaoGasto', () => {
  it('e zero sem historico', () => {
    expect(dinheiroNaoGasto([])).toBe(0);
  });

  it('e zero quando a pessoa nunca declarou aposta no baseline', () => {
    const entradas = [em('2026-08-01T11:00:00'), em('2026-08-20T11:00:00')];
    expect(dinheiroNaoGasto(entradas, new Date('2026-08-29T11:00:00'))).toBe(0);
  });

  it('projeta o ritmo do baseline e desconta o que foi gasto depois', () => {
    const entradas = [em('2026-08-01T11:00:00', { apostou: true, faixa: '200_500' })];
    // 200 em 14 dias -> 400 esperados em 28 dias -> 200 economizados
    expect(dinheiroNaoGasto(entradas, new Date('2026-08-29T11:00:00'))).toBe(200);
  });

  it('zera quando a pessoa manteve o mesmo ritmo', () => {
    const entradas = [
      em('2026-08-01T11:00:00', { apostou: true, faixa: '200_500' }),
      em('2026-08-20T11:00:00', { apostou: true, faixa: '200_500' }),
    ];
    expect(dinheiroNaoGasto(entradas, new Date('2026-08-29T11:00:00'))).toBe(0);
  });

  it('nunca fica negativo, mesmo se a pessoa gastou mais', () => {
    const entradas = [
      em('2026-08-01T11:00:00', { apostou: true, faixa: 'ate_50' }),
      em('2026-08-20T11:00:00', { apostou: true, faixa: 'mais_500' }),
    ];
    expect(dinheiroNaoGasto(entradas, new Date('2026-08-29T11:00:00'))).toBe(0);
  });
});
