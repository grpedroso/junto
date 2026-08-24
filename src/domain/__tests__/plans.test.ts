import { BIBLIOTECA, eficacia, escolherPlano } from '../plans';
import type { Plano } from '../tipos';

const plano = (p: Partial<Plano> & { id: string }): Plano => ({
  condicao: 'bater vontade',
  acao: 'fazer alguma coisa',
  categoria: 'substituicao',
  gatilhos: [],
  vezesMostrado: 0,
  vezesFuncionou: 0,
  ...p,
});

describe('biblioteca', () => {
  it('nao tem id repetido', () => {
    const ids = BIBLIOTECA.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('lidera com substituicao, a categoria mais escolhida nos estudos', () => {
    expect(BIBLIOTECA[0].categoria).toBe('substituicao');
  });

  it('cobre todo gatilho que o usuario pode marcar', () => {
    const cobertos = new Set(BIBLIOTECA.flatMap((m) => m.gatilhos));
    for (const g of [
      'dinheiro_apertado',
      'propaganda',
      'amigos_apostando',
      'jogo_passando',
      'tedio',
      'briga_estresse',
      'nada',
    ]) {
      expect(cobertos.has(g as never)).toBe(true);
    }
  });
});

describe('eficacia', () => {
  it('da meio ponto a quem nunca foi usado', () => {
    expect(eficacia({ vezesMostrado: 0, vezesFuncionou: 0 })).toBe(0.5);
  });

  it('nao deixa 1 de 1 valer mais que 8 de 10', () => {
    const novato = eficacia({ vezesMostrado: 1, vezesFuncionou: 1 });
    const veterano = eficacia({ vezesMostrado: 10, vezesFuncionou: 8 });
    expect(veterano).toBeGreaterThan(novato);
  });
});

describe('escolherPlano', () => {
  it('devolve nulo quando a pessoa nao tem plano nenhum', () => {
    expect(escolherPlano([], ['tedio'])).toBeNull();
  });

  it('prefere o plano feito para aquele gatilho', () => {
    const planos = [
      plano({ id: 'generico', vezesMostrado: 20, vezesFuncionou: 20 }),
      plano({ id: 'do_gatilho', gatilhos: ['propaganda'] }),
    ];
    expect(escolherPlano(planos, ['propaganda'])?.id).toBe('do_gatilho');
  });

  it('entre os do gatilho, pega o que mais funcionou', () => {
    const planos = [
      plano({ id: 'fraco', gatilhos: ['tedio'], vezesMostrado: 10, vezesFuncionou: 1 }),
      plano({ id: 'forte', gatilhos: ['tedio'], vezesMostrado: 10, vezesFuncionou: 9 }),
    ];
    expect(escolherPlano(planos, ['tedio'])?.id).toBe('forte');
  });

  it('cai no mais eficaz quando nenhum plano cobre o gatilho', () => {
    const planos = [
      plano({ id: 'a', gatilhos: ['propaganda'], vezesMostrado: 10, vezesFuncionou: 2 }),
      plano({ id: 'b', gatilhos: ['propaganda'], vezesMostrado: 10, vezesFuncionou: 9 }),
    ];
    expect(escolherPlano(planos, ['jogo_passando'])?.id).toBe('b');
  });

  it('ignora "nada" como gatilho -- nao e um gatilho de verdade', () => {
    const planos = [
      plano({ id: 'com_nada', gatilhos: ['nada'], vezesMostrado: 10, vezesFuncionou: 0 }),
      plano({ id: 'melhor', gatilhos: ['propaganda'], vezesMostrado: 10, vezesFuncionou: 10 }),
    ];
    expect(escolherPlano(planos, ['nada'])?.id).toBe('melhor');
  });

  it('funciona sem gatilho nenhum, que e o caso do SOS', () => {
    const planos = [
      plano({ id: 'a', vezesMostrado: 4, vezesFuncionou: 0 }),
      plano({ id: 'b', vezesMostrado: 4, vezesFuncionou: 4 }),
    ];
    expect(escolherPlano(planos)?.id).toBe('b');
  });

  it('desempata pelo menos mostrado, para o novo ter vez', () => {
    const planos = [
      plano({ id: 'rodado', vezesMostrado: 8, vezesFuncionou: 4 }),
      plano({ id: 'novo', vezesMostrado: 0, vezesFuncionou: 0 }),
    ];
    expect(escolherPlano(planos)?.id).toBe('novo');
  });
});
