import type { CategoriaPlano, Gatilho, Plano } from './tipos';

/**
 * Planos de enfrentamento no formato "Quando X, eu vou Y"
 * (implementation intentions). Criados em momento calmo, nunca durante a crise.
 *
 * Substituicao vem primeiro porque foi a categoria mais escolhida por usuarios
 * reais no Gambling Habit Hacker (DOI 10.1186/s13722-025-00573-y).
 *
 * O texto de cada um mora em src/i18n/pt-BR.ts -- aqui fica so a estrutura.
 */
export type ModeloPlano = {
  id: string;
  categoria: CategoriaPlano;
  gatilhos: Gatilho[];
};

export const BIBLIOTECA: ModeloPlano[] = [
  { id: 'banho_gelado', categoria: 'substituicao', gatilhos: ['tedio', 'nada'] },
  { id: 'caminhar_10min', categoria: 'substituicao', gatilhos: ['tedio', 'briga_estresse', 'nada'] },
  { id: 'lavar_louca', categoria: 'substituicao', gatilhos: ['tedio', 'nada'] },
  { id: 'jogo_no_radio', categoria: 'substituicao', gatilhos: ['jogo_passando'] },
  { id: 'mandar_mensagem', categoria: 'social', gatilhos: ['nada', 'tedio', 'briga_estresse'] },
  { id: 'ligar_de_noite', categoria: 'social', gatilhos: ['tedio', 'nada'] },
  { id: 'flexoes', categoria: 'fisico', gatilhos: ['briga_estresse', 'nada'] },
  { id: 'respiracao_478', categoria: 'fisico', gatilhos: ['briga_estresse', 'nada'] },
  { id: 'lembrar_ultima_vez', categoria: 'cognitivo', gatilhos: ['dinheiro_apertado', 'nada'] },
  { id: 'esperar_15min', categoria: 'cognitivo', gatilhos: ['nada', 'propaganda', 'amigos_apostando'] },
  { id: 'bloquear_remetente', categoria: 'ambiental', gatilhos: ['propaganda'] },
  { id: 'separar_contas', categoria: 'ambiental', gatilhos: ['dinheiro_apertado'] },
];

export const MINIMO_DE_PLANOS = 2;

/**
 * Eficacia com suavizacao de Laplace: um plano nunca mostrado vale 0.5, entao
 * nao perde de cara para um que funcionou 1 de 1. Com poucos dados -- que e o
 * caso sempre no inicio -- a razao crua e ruido.
 */
export function eficacia(p: Pick<Plano, 'vezesMostrado' | 'vezesFuncionou'>): number {
  return (p.vezesFuncionou + 1) / (p.vezesMostrado + 2);
}

const melhor = (planos: Plano[]): Plano | null =>
  planos.length === 0
    ? null
    : [...planos].sort(
        (a, b) => eficacia(b) - eficacia(a) || a.vezesMostrado - b.vezesMostrado
      )[0];

/**
 * Mostra o plano que a propria pessoa criou para aquele gatilho. Se nao houver
 * plano para o gatilho, mostra o mais eficaz dela ate agora (secao 6.4).
 *
 * `gatilhos` vazio acontece quando a intervencao vem do SOS, fora do ciclo das
 * EMAs: nao ha resposta, entao nao ha gatilho declarado.
 */
export function escolherPlano(planos: Plano[], gatilhos: Gatilho[] = []): Plano | null {
  const relevantes: Gatilho[] = gatilhos.filter((g) => g !== 'nada');
  const casaram = planos.filter((p) => p.gatilhos.some((g) => relevantes.includes(g)));
  return melhor(casaram) ?? melhor(planos);
}
