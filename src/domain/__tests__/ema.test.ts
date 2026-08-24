import {
  avaliarDisparo,
  comJitter,
  EMAS_PARA_CUIDADO,
  LIMIAR,
  precisaTelaDeCuidado,
} from '../ema';
import type { Humor } from '../tipos';

describe('avaliarDisparo', () => {
  it('dispara com craving no limiar exato', () => {
    expect(avaliarDisparo({ craving: 7, autoeficacia: 10 })).toEqual({
      dispara: true,
      motivo: 'craving_alto',
    });
  });

  it('nao dispara um ponto abaixo do craving alto, com autoeficacia boa', () => {
    expect(avaliarDisparo({ craving: 6, autoeficacia: 6 })).toEqual({
      dispara: false,
      motivo: null,
    });
  });

  it('dispara com autoeficacia no limiar exato', () => {
    expect(avaliarDisparo({ craving: 0, autoeficacia: 3 })).toEqual({
      dispara: true,
      motivo: 'autoeficacia_baixa',
    });
  });

  it('nao dispara um ponto acima da autoeficacia baixa, com craving baixo', () => {
    expect(avaliarDisparo({ craving: 4, autoeficacia: 4 }).dispara).toBe(false);
  });

  it('dispara na combinacao dos dois medios', () => {
    expect(avaliarDisparo({ craving: 5, autoeficacia: 5 })).toEqual({
      dispara: true,
      motivo: 'combinado',
    });
  });

  it('registra o motivo mais especifico quando mais de uma condicao vale', () => {
    expect(avaliarDisparo({ craving: 9, autoeficacia: 1 }).motivo).toBe('craving_alto');
    expect(avaliarDisparo({ craving: 6, autoeficacia: 2 }).motivo).toBe('autoeficacia_baixa');
  });

  it('nao dispara no caso tranquilo', () => {
    expect(avaliarDisparo({ craving: 0, autoeficacia: 10 }).dispara).toBe(false);
  });

  it.each([
    [-1, 5],
    [11, 5],
    [5, -1],
    [5, 11],
    [5.5, 5],
  ])('recusa valor fora da escala (%p, %p)', (craving, autoeficacia) => {
    expect(() => avaliarDisparo({ craving, autoeficacia })).toThrow(/escala/);
  });

  it('cobre a grade inteira sem buraco na regra', () => {
    for (let c = 0; c <= 10; c++) {
      for (let a = 0; a <= 10; a++) {
        const esperado =
          c >= LIMIAR.cravingAlto ||
          a <= LIMIAR.autoeficaciaBaixa ||
          (c >= LIMIAR.cravingMedio && a <= LIMIAR.autoeficaciaMedia);
        expect(avaliarDisparo({ craving: c, autoeficacia: a }).dispara).toBe(esperado);
      }
    }
  });
});

describe('comJitter', () => {
  it('nao desloca no meio do sorteio', () => {
    expect(comJitter({ hora: 11, minuto: 0 }, 30, () => 0.5)).toEqual({ hora: 11, minuto: 0 });
  });

  it('desloca ate meia hora para tras e para frente', () => {
    expect(comJitter({ hora: 17, minuto: 0 }, 30, () => 0)).toEqual({ hora: 16, minuto: 30 });
    expect(comJitter({ hora: 17, minuto: 0 }, 30, () => 1)).toEqual({ hora: 17, minuto: 30 });
  });

  it('vira o dia sem estourar a hora', () => {
    expect(comJitter({ hora: 0, minuto: 10 }, 30, () => 0)).toEqual({ hora: 23, minuto: 40 });
    expect(comJitter({ hora: 23, minuto: 50 }, 30, () => 1)).toEqual({ hora: 0, minuto: 20 });
  });

  it('fica sempre dentro da janela, em mil sorteios', () => {
    for (let i = 0; i < 1000; i++) {
      const { hora, minuto } = comJitter({ hora: 21, minuto: 0 });
      const minutos = hora * 60 + minuto;
      expect(minutos).toBeGreaterThanOrEqual(21 * 60 - 30);
      expect(minutos).toBeLessThanOrEqual(21 * 60 + 30);
    }
  });
});

describe('precisaTelaDeCuidado', () => {
  const pesada = (humor: Humor = 'triste') => ({ craving: 8, humor });
  const leve = { craving: 2, humor: 'tranquilo' as Humor };

  it('nao oferece antes de haver EMAs suficientes', () => {
    expect(precisaTelaDeCuidado([pesada(), pesada()])).toBe(false);
  });

  it('oferece depois de tres pesadas seguidas', () => {
    expect(precisaTelaDeCuidado([pesada(), pesada('irritado'), pesada()])).toBe(true);
  });

  it('nao oferece se uma das tres mais recentes nao foi pesada', () => {
    expect(precisaTelaDeCuidado([pesada(), leve, pesada(), pesada()])).toBe(false);
  });

  it('olha so as mais recentes, nao o historico inteiro', () => {
    const historico = [pesada(), pesada(), pesada(), leve, leve];
    expect(precisaTelaDeCuidado(historico, EMAS_PARA_CUIDADO)).toBe(true);
  });

  it('humor negativo com craving baixo nao basta', () => {
    const so_triste = { craving: 3, humor: 'triste' as Humor };
    expect(precisaTelaDeCuidado([so_triste, so_triste, so_triste])).toBe(false);
  });

  it('craving alto com humor bom nao basta', () => {
    const so_craving = { craving: 9, humor: 'animado' as Humor };
    expect(precisaTelaDeCuidado([so_craving, so_craving, so_craving])).toBe(false);
  });
});
