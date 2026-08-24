export type Humor = 'tranquilo' | 'ansioso' | 'triste' | 'irritado' | 'animado' | 'entediado';

export type Gatilho =
  | 'dinheiro_apertado'
  | 'propaganda'
  | 'amigos_apostando'
  | 'jogo_passando'
  | 'tedio'
  | 'briga_estresse'
  | 'nada';

export type Contexto = 'casa' | 'trabalho' | 'rua' | 'sozinho' | 'acompanhado';

export type FaixaValor = 'ate_50' | '50_200' | '200_500' | 'mais_500';

export type CategoriaPlano = 'substituicao' | 'social' | 'fisico' | 'cognitivo' | 'ambiental';

export type Meta = 'parar' | 'reduzir';

export type DesfechoIntervencao = 'resistiu' | 'apostou' | 'sem_resposta';

export type RespostaEma = {
  craving: number;
  autoeficacia: number;
  humor: Humor;
  gatilhos: Gatilho[];
  contexto: Contexto[];
  apostouDesdeUltima: boolean;
  faixaValor: FaixaValor | null;
};

export type Plano = {
  id: string;
  condicao: string;
  acao: string;
  categoria: CategoriaPlano;
  gatilhos: Gatilho[];
  vezesMostrado: number;
  vezesFuncionou: number;
};
