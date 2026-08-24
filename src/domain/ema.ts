import type { Humor, RespostaEma } from './tipos';

/**
 * Regra de disparo do MVP. Fixa e auditavel de proposito: da para explicar a
 * pessoa por que o app agiu. ML so na fase 3, quando houver dados.
 *
 * Craving e autoeficacia momentaneos sao os dois unicos preditores que a
 * literatura confirma operarem em tempo real (Dowling et al. 2023). Humor,
 * gatilho e contexto entram no dataset mas NAO disparam nada aqui.
 *
 * Mexer nestes numeros exige revisao clinica -- ver CONTRIBUTING.md.
 */
export const LIMIAR = {
  cravingAlto: 7,
  autoeficaciaBaixa: 3,
  cravingMedio: 5,
  autoeficaciaMedia: 5,
} as const;

export const ESCALA = { min: 0, max: 10 } as const;

export type MotivoDisparo = 'craving_alto' | 'autoeficacia_baixa' | 'combinado';

export type Disparo =
  | { dispara: true; motivo: MotivoDisparo }
  | { dispara: false; motivo: null };

const naEscala = (n: number) =>
  Number.isInteger(n) && n >= ESCALA.min && n <= ESCALA.max;

/**
 * craving >= 7 OU autoeficacia <= 3 OU (craving >= 5 E autoeficacia <= 5)
 *
 * A ordem dos testes define o motivo registrado quando mais de uma condicao
 * vale ao mesmo tempo: a mais especifica primeiro.
 */
export function avaliarDisparo(r: Pick<RespostaEma, 'craving' | 'autoeficacia'>): Disparo {
  if (!naEscala(r.craving) || !naEscala(r.autoeficacia)) {
    throw new Error(
      `resposta fora da escala ${ESCALA.min}-${ESCALA.max}: ` +
        `craving=${r.craving}, autoeficacia=${r.autoeficacia}`
    );
  }

  if (r.craving >= LIMIAR.cravingAlto) {
    return { dispara: true, motivo: 'craving_alto' };
  }
  if (r.autoeficacia <= LIMIAR.autoeficaciaBaixa) {
    return { dispara: true, motivo: 'autoeficacia_baixa' };
  }
  if (r.craving >= LIMIAR.cravingMedio && r.autoeficacia <= LIMIAR.autoeficaciaMedia) {
    return { dispara: true, motivo: 'combinado' };
  }
  return { dispara: false, motivo: null };
}

export const HORARIOS_PADRAO = [
  { hora: 11, minuto: 0 },
  { hora: 17, minuto: 0 },
  { hora: 21, minuto: 0 },
] as const;

/** O jitter existe para a resposta nao virar automatica -- reflexao, nao reflexo. */
export const JITTER_MINUTOS = 30;

export type Horario = { hora: number; minuto: number };

/**
 * Sorteia um deslocamento inteiro em [-JITTER, +JITTER] minutos.
 * `sorteio` e injetavel para o teste ser deterministico.
 */
export function comJitter(
  h: Horario,
  jitter = JITTER_MINUTOS,
  sorteio: () => number = Math.random
): Horario {
  const desloc = Math.round((sorteio() * 2 - 1) * jitter);
  const total = (h.hora * 60 + h.minuto + desloc + 1440) % 1440;
  return { hora: Math.floor(total / 60), minuto: total % 60 };
}

const HUMOR_NEGATIVO: Humor[] = ['triste', 'irritado'];

/** Quantas EMAs seguidas pesadas antes de oferecer a tela de cuidado. */
export const EMAS_PARA_CUIDADO = 3;

/**
 * Tela de cuidado da secao 9.1: humor negativo persistente junto de craving
 * alto. Le da mais recente para a mais antiga e exige uma sequencia sem furo.
 *
 * O app NAO faz triagem de risco suicida -- isto so decide se vale oferecer
 * uma rota para ajuda, sem alarme e sem diagnostico.
 *
 * TODO clinico: o limiar exato (3 EMAs, craving >= 7) precisa de revisao.
 */
export function precisaTelaDeCuidado(
  ultimas: Pick<RespostaEma, 'craving' | 'humor'>[],
  quantas = EMAS_PARA_CUIDADO
): boolean {
  if (ultimas.length < quantas) return false;
  return ultimas
    .slice(0, quantas)
    .every((r) => HUMOR_NEGATIVO.includes(r.humor) && r.craving >= LIMIAR.cravingAlto);
}
