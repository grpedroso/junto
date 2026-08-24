/**
 * PGSI -- Problem Gambling Severity Index. 9 itens, escala 0-3, referencia aos
 * ultimos 12 meses. Adaptacao transcultural brasileira publicada na Revista de
 * Saude Publica em 2026 (DOI 10.11606/s1518-8787.2026060007368).
 *
 * NAO e ferramenta diagnostica -- foi criado para pesquisa populacional. O app
 * apresenta o resultado como "um retrato de onde voce esta", nunca como
 * diagnostico. Ver src/i18n/pt-BR.ts.
 */

export const PGSI_ITENS = [
  'apostou_mais_que_podia',
  'precisou_apostar_mais',
  'voltou_para_recuperar',
  'vendeu_ou_pediu_emprestado',
  'sentiu_que_tem_problema',
  'causou_problema_de_saude',
  'foi_criticado',
  'causou_problema_financeiro',
  'sentiu_culpa',
] as const;

export type ItemPgsi = (typeof PGSI_ITENS)[number];

export const PGSI_OPCOES = [0, 1, 2, 3] as const;
export const PGSI_MAX = PGSI_ITENS.length * 3;

export type FaixaPgsi = 'sem_risco' | 'baixo' | 'moderado' | 'problematico';

/**
 * Existem dois conjuntos de cortes na literatura. O original de Ferris & Wynne
 * e o padrao aqui; o alternativo aparece em estudos posteriores.
 *
 * TODO clinico: confirmar com o revisor qual adotar antes de mostrar faixa a
 * qualquer usuario real. A diferenca move gente de "baixo" para "moderado".
 */
export type Cortes = 'ferris_wynne' | 'alternativo';

const TABELA: Record<Cortes, { max: number; faixa: FaixaPgsi }[]> = {
  ferris_wynne: [
    { max: 0, faixa: 'sem_risco' },
    { max: 2, faixa: 'baixo' },
    { max: 7, faixa: 'moderado' },
    { max: PGSI_MAX, faixa: 'problematico' },
  ],
  alternativo: [
    { max: 0, faixa: 'sem_risco' },
    { max: 4, faixa: 'baixo' },
    { max: 7, faixa: 'moderado' },
    { max: PGSI_MAX, faixa: 'problematico' },
  ],
};

export type RespostasPgsi = Record<ItemPgsi, number>;

export function calcularPgsi(respostas: RespostasPgsi): number {
  return PGSI_ITENS.reduce((total, item) => {
    const v = respostas[item];
    if (!Number.isInteger(v) || v < 0 || v > 3) {
      throw new Error(`item "${item}" fora da escala 0-3: ${v}`);
    }
    return total + v;
  }, 0);
}

export function faixaPgsi(escore: number, cortes: Cortes = 'ferris_wynne'): FaixaPgsi {
  if (!Number.isInteger(escore) || escore < 0 || escore > PGSI_MAX) {
    throw new Error(`escore fora de 0-${PGSI_MAX}: ${escore}`);
  }
  return TABELA[cortes].find((f) => escore <= f.max)!.faixa;
}

/** O PGSI e reaplicado a cada 30 dias para medir evolucao. */
export const DIAS_ENTRE_PGSI = 30;

export function podeReaplicar(ultimoEm: Date, agora: Date = new Date()): boolean {
  const dias = (agora.getTime() - ultimoEm.getTime()) / 86_400_000;
  return dias >= DIAS_ENTRE_PGSI;
}
