import type { FaixaValor } from './tipos';

export type EntradaRespondida = {
  respondidaEm: Date;
  craving: number;
  apostouDesdeUltima: boolean;
  faixaValor: FaixaValor | null;
};

const DIA = 86_400_000;

// Data no fuso do aparelho, nao em UTC: no Brasil uma EMA das 21h cairia no dia
// seguinte se contada em UTC, e "dias sem apostar" sairia errado.
const dataLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/**
 * Piso de cada faixa, nao o meio. Subestimar de proposito: "dinheiro nao gasto"
 * e uma promessa que o app faz a pessoa, e e melhor entregar mais do que
 * prometeu. `mais_500` nao tem teto, entao vale 500.
 */
const PISO_DA_FAIXA: Record<FaixaValor, number> = {
  ate_50: 25,
  '50_200': 50,
  '200_500': 200,
  mais_500: 500,
};

/**
 * Dias desde a ultima aposta declarada. Reinicia quando acontece -- e o que a
 * pessoa quer ver -- mas quem escreve o texto em volta nao pode tratar isso
 * como fracasso. Ver as regras de linguagem em CONTRIBUTING.md.
 */
export function diasDesdeUltimaAposta(
  entradas: EntradaRespondida[],
  agora: Date = new Date()
): number | null {
  const comAposta = entradas
    .filter((e) => e.apostouDesdeUltima)
    .sort((a, b) => b.respondidaEm.getTime() - a.respondidaEm.getTime());
  const inicio = comAposta[0]?.respondidaEm ?? menorData(entradas);
  if (!inicio) return null;
  return Math.floor((agora.getTime() - inicio.getTime()) / DIA);
}

/**
 * Total acumulado de dias limpos desde sempre. Existe justamente porque o
 * contador de cima reinicia: recaida e recomeco, nao apagamento do que passou.
 */
export function totalDeDiasSemAposta(entradas: EntradaRespondida[]): number {
  const porDia = new Map<string, boolean>();
  for (const e of entradas) {
    const chave = dataLocal(e.respondidaEm);
    porDia.set(chave, (porDia.get(chave) ?? false) || e.apostouDesdeUltima);
  }
  return [...porDia.values()].filter((apostou) => !apostou).length;
}

export type PontoSemanal = { semana: string; media: number; n: number };

/** Curva de craving por semana ISO. Mostrar que a vontade cai e dado real. */
export function cravingPorSemana(entradas: EntradaRespondida[]): PontoSemanal[] {
  const grupos = new Map<string, number[]>();
  for (const e of entradas) {
    const chave = semanaIso(e.respondidaEm);
    grupos.set(chave, [...(grupos.get(chave) ?? []), e.craving]);
  }
  return [...grupos.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([semana, vs]) => ({
      semana,
      media: vs.reduce((s, v) => s + v, 0) / vs.length,
      n: vs.length,
    }));
}

export const DIAS_DE_BASELINE = 14;

/**
 * Quanto a pessoa deixou de gastar: o ritmo das duas primeiras semanas
 * projetado para o periodo inteiro, menos o que ela declarou ter gasto depois.
 * Nunca negativo -- numero negativo aqui viraria cobranca.
 */
export function dinheiroNaoGasto(
  entradas: EntradaRespondida[],
  agora: Date = new Date()
): number {
  const inicio = menorData(entradas);
  if (!inicio) return 0;

  const fimDoBaseline = new Date(inicio.getTime() + DIAS_DE_BASELINE * DIA);
  const noBaseline = entradas.filter((e) => e.respondidaEm < fimDoBaseline);
  const gastoNoBaseline = somaDeclarada(noBaseline);
  if (gastoNoBaseline === 0) return 0;

  const diasCorridos = Math.max((agora.getTime() - inicio.getTime()) / DIA, DIAS_DE_BASELINE);
  const esperado = (gastoNoBaseline / DIAS_DE_BASELINE) * diasCorridos;
  const gastoDepois = somaDeclarada(entradas.filter((e) => e.respondidaEm >= fimDoBaseline));

  return Math.max(0, Math.round(esperado - gastoNoBaseline - gastoDepois));
}

const somaDeclarada = (entradas: EntradaRespondida[]) =>
  entradas.reduce((s, e) => s + (e.faixaValor ? PISO_DA_FAIXA[e.faixaValor] : 0), 0);

const menorData = (entradas: EntradaRespondida[]): Date | null =>
  entradas.length === 0
    ? null
    : new Date(Math.min(...entradas.map((e) => e.respondidaEm.getTime())));

/** Ano-semana ISO, no formato 2026-W34. */
export function semanaIso(d: Date): string {
  const alvo = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const diaDaSemana = alvo.getUTCDay() || 7;
  alvo.setUTCDate(alvo.getUTCDate() + 4 - diaDaSemana);
  const primeiro = new Date(Date.UTC(alvo.getUTCFullYear(), 0, 1));
  const semana = Math.ceil(((alvo.getTime() - primeiro.getTime()) / DIA + 1) / 7);
  return `${alvo.getUTCFullYear()}-W${String(semana).padStart(2, '0')}`;
}
