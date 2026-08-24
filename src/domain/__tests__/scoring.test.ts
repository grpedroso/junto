import {
  calcularPgsi,
  DIAS_ENTRE_PGSI,
  faixaPgsi,
  PGSI_ITENS,
  PGSI_MAX,
  podeReaplicar,
  type RespostasPgsi,
} from '../scoring';

const todas = (v: number): RespostasPgsi =>
  Object.fromEntries(PGSI_ITENS.map((i) => [i, v])) as RespostasPgsi;

describe('calcularPgsi', () => {
  it('tem 9 itens e teto 27', () => {
    expect(PGSI_ITENS).toHaveLength(9);
    expect(PGSI_MAX).toBe(27);
  });

  it('soma zero quando tudo e nunca', () => {
    expect(calcularPgsi(todas(0))).toBe(0);
  });

  it('soma o maximo quando tudo e quase sempre', () => {
    expect(calcularPgsi(todas(3))).toBe(27);
  });

  it('soma item a item', () => {
    const r = { ...todas(0), apostou_mais_que_podia: 3, sentiu_culpa: 2 };
    expect(calcularPgsi(r)).toBe(5);
  });

  it('recusa item fora da escala 0-3', () => {
    expect(() => calcularPgsi({ ...todas(0), sentiu_culpa: 4 })).toThrow(/sentiu_culpa/);
    expect(() => calcularPgsi({ ...todas(0), foi_criticado: -1 })).toThrow(/escala/);
  });
});

describe('faixaPgsi', () => {
  it('usa os cortes de Ferris & Wynne por padrao', () => {
    expect(faixaPgsi(0)).toBe('sem_risco');
    expect(faixaPgsi(1)).toBe('baixo');
    expect(faixaPgsi(2)).toBe('baixo');
    expect(faixaPgsi(3)).toBe('moderado');
    expect(faixaPgsi(7)).toBe('moderado');
    expect(faixaPgsi(8)).toBe('problematico');
    expect(faixaPgsi(27)).toBe('problematico');
  });

  it('move a fronteira quando os cortes alternativos sao adotados', () => {
    expect(faixaPgsi(3, 'alternativo')).toBe('baixo');
    expect(faixaPgsi(4, 'alternativo')).toBe('baixo');
    expect(faixaPgsi(5, 'alternativo')).toBe('moderado');
    expect(faixaPgsi(8, 'alternativo')).toBe('problematico');
  });

  it('recusa escore impossivel', () => {
    expect(() => faixaPgsi(28)).toThrow();
    expect(() => faixaPgsi(-1)).toThrow();
  });
});

describe('podeReaplicar', () => {
  const base = new Date('2026-08-23T12:00:00Z');

  it('nao reaplica antes de 30 dias', () => {
    const em29 = new Date(base.getTime() + 29 * 86_400_000);
    expect(podeReaplicar(base, em29)).toBe(false);
  });

  it('reaplica exatamente no trigesimo dia', () => {
    const em30 = new Date(base.getTime() + DIAS_ENTRE_PGSI * 86_400_000);
    expect(podeReaplicar(base, em30)).toBe(true);
  });
});
