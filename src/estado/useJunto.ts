import { create } from 'zustand';
import { BIBLIOTECA, MINIMO_DE_PLANOS } from '@/domain/plans';
import { HORARIOS_PADRAO, type Horario, type MotivoDisparo } from '@/domain/ema';
import type { DesfechoIntervencao, Meta, Plano, RespostaEma } from '@/domain/tipos';
import { agendarEmas, agendarFollowUp, cancelarFollowUp } from '@/lib/notifications';
import { garantirSessao } from '@/lib/sessao';
import { CHAVES, descarregar, enfileirar, gravar, ler, novoId } from '@/lib/storage';
import ptBR from '@/i18n/pt-BR';

export type Perfil = {
  id: string;
  meta: Meta;
  horarios: Horario[];
  onboardingFeito: boolean;
  baselinePgsi: number | null;
  pgsiEm: string | null;
};

export type EmaSalva = RespostaEma & { id: string; respondidaEm: string };

export type IntervencaoSalva = {
  id: string;
  emaId: string | null;
  planoId: string | null;
  motivo: MotivoDisparo | 'sos';
  criadaEm: string;
  desfecho: DesfechoIntervencao | null;
};

type Estado = {
  carregando: boolean;
  perfil: Perfil | null;
  planos: Plano[];
  emas: EmaSalva[];
  intervencoes: IntervencaoSalva[];

  iniciar: () => Promise<void>;
  definirMeta: (meta: Meta) => Promise<void>;
  definirHorarios: (horarios: Horario[]) => Promise<void>;
  concluirOnboarding: () => Promise<void>;
  registrarPgsi: (escore: number) => Promise<void>;

  adotarModelo: (modeloId: string) => Promise<void>;
  criarPlano: (p: Omit<Plano, 'id' | 'vezesMostrado' | 'vezesFuncionou'>) => Promise<Plano>;
  editarPlano: (id: string, campos: Partial<Plano>) => Promise<void>;
  apagarPlano: (id: string) => Promise<void>;
  contabilizarPlano: (id: string, funcionou: boolean) => Promise<void>;

  salvarEma: (r: RespostaEma) => Promise<EmaSalva>;
  criarIntervencao: (
    motivo: MotivoDisparo | 'sos',
    emaId: string | null,
    planoId: string | null
  ) => Promise<IntervencaoSalva>;
  responderFollowUp: (id: string, desfecho: DesfechoIntervencao) => Promise<void>;
};

const PERFIL_PADRAO = (id: string): Perfil => ({
  id,
  meta: 'parar',
  horarios: [...HORARIOS_PADRAO],
  onboardingFeito: false,
  baselinePgsi: null,
  pgsiEm: null,
});

export const useJunto = create<Estado>((set, get) => ({
  carregando: true,
  perfil: null,
  planos: [],
  emas: [],
  intervencoes: [],

  iniciar: async () => {
    const [perfilLocal, planos, emas, intervencoes] = await Promise.all([
      ler<Perfil>(CHAVES.perfil),
      ler<Plano[]>(CHAVES.planos),
      ler<EmaSalva[]>(CHAVES.emas),
      ler<IntervencaoSalva[]>(CHAVES.intervencoes),
    ]);

    // A tela abre com o que esta no aparelho; a sessao vem depois e pode falhar
    // sem rede. Offline-first: nada aqui espera o servidor.
    set({
      perfil: perfilLocal,
      planos: planos ?? [],
      emas: emas ?? [],
      intervencoes: intervencoes ?? [],
      carregando: false,
    });

    try {
      const id = await garantirSessao();
      const perfil = perfilLocal ?? PERFIL_PADRAO(id);
      if (perfil.id !== id) perfil.id = id;
      set({ perfil });
      await gravar(CHAVES.perfil, perfil);
      await descarregar();
    } catch {
      // sem rede no primeiro acesso: segue local, sincroniza na proxima abertura
    }
  },

  definirMeta: async (meta) => {
    const perfil = { ...exigirPerfil(get), meta };
    set({ perfil });
    await gravar(CHAVES.perfil, perfil);
    await enfileirar('users', { id: perfil.id, goal: meta });
  },

  definirHorarios: async (horarios) => {
    const perfil = { ...exigirPerfil(get), horarios };
    set({ perfil });
    await gravar(CHAVES.perfil, perfil);
    await enfileirar('users', {
      id: perfil.id,
      ema_times: horarios.map((h) => `${pad(h.hora)}:${pad(h.minuto)}`),
    });
    await agendarEmas(horarios);
  },

  concluirOnboarding: async () => {
    const perfil = { ...exigirPerfil(get), onboardingFeito: true };
    set({ perfil });
    await gravar(CHAVES.perfil, perfil);
    await agendarEmas(perfil.horarios);
  },

  registrarPgsi: async (escore) => {
    const agora = new Date().toISOString();
    const perfil = { ...exigirPerfil(get), baselinePgsi: escore, pgsiEm: agora };
    set({ perfil });
    await gravar(CHAVES.perfil, perfil);
    await enfileirar('users', { id: perfil.id, baseline_pgsi: escore, pgsi_at: agora });
  },

  adotarModelo: async (modeloId) => {
    const modelo = BIBLIOTECA.find((m) => m.id === modeloId);
    if (!modelo) throw new Error(`modelo desconhecido: ${modeloId}`);
    const texto = ptBR.planos.biblioteca[modeloId as keyof typeof ptBR.planos.biblioteca];
    await get().criarPlano({
      condicao: texto.condicao,
      acao: texto.acao,
      categoria: modelo.categoria,
      gatilhos: modelo.gatilhos,
    });
  },

  criarPlano: async (p) => {
    const plano: Plano = { ...p, id: novoId(), vezesMostrado: 0, vezesFuncionou: 0 };
    const planos = [...get().planos, plano];
    set({ planos });
    await gravar(CHAVES.planos, planos);
    await enfileirar('coping_plans', linhaDoPlano(plano, exigirPerfil(get).id));
    return plano;
  },

  editarPlano: async (id, campos) => {
    const planos = get().planos.map((p) => (p.id === id ? { ...p, ...campos } : p));
    set({ planos });
    await gravar(CHAVES.planos, planos);
    const alterado = planos.find((p) => p.id === id);
    if (alterado) await enfileirar('coping_plans', linhaDoPlano(alterado, exigirPerfil(get).id));
  },

  apagarPlano: async (id) => {
    const planos = get().planos.filter((p) => p.id !== id);
    set({ planos });
    await gravar(CHAVES.planos, planos);
    await enfileirar('coping_plans', {
      id,
      user_id: exigirPerfil(get).id,
      archived_at: new Date().toISOString(),
    });
  },

  contabilizarPlano: async (id, funcionou) => {
    const atual = get().planos.find((p) => p.id === id);
    if (!atual) return;
    await get().editarPlano(id, {
      vezesMostrado: atual.vezesMostrado + 1,
      vezesFuncionou: atual.vezesFuncionou + (funcionou ? 1 : 0),
    });
  },

  salvarEma: async (r) => {
    const perfil = exigirPerfil(get);
    const ema: EmaSalva = { ...r, id: novoId(), respondidaEm: new Date().toISOString() };
    const emas = [ema, ...get().emas];
    set({ emas });
    await gravar(CHAVES.emas, emas);
    await enfileirar('ema_entries', {
      id: ema.id,
      user_id: perfil.id,
      scheduled_at: ema.respondidaEm,
      answered_at: ema.respondidaEm,
      craving: ema.craving,
      self_efficacy: ema.autoeficacia,
      mood: ema.humor,
      triggers: ema.gatilhos,
      context: ema.contexto,
      gambled_since_last: ema.apostouDesdeUltima,
      amount_band: ema.faixaValor,
    });
    return ema;
  },

  criarIntervencao: async (motivo, emaId, planoId) => {
    const perfil = exigirPerfil(get);
    const intervencao: IntervencaoSalva = {
      id: novoId(),
      emaId,
      planoId,
      motivo,
      criadaEm: new Date().toISOString(),
      desfecho: null,
    };
    const intervencoes = [intervencao, ...get().intervencoes];
    set({ intervencoes });
    await gravar(CHAVES.intervencoes, intervencoes);
    await enfileirar('interventions', {
      id: intervencao.id,
      user_id: perfil.id,
      ema_id: emaId,
      plan_id: planoId,
      triggered_at: intervencao.criadaEm,
      trigger_reason: motivo,
    });
    await agendarFollowUp(intervencao.id);
    return intervencao;
  },

  responderFollowUp: async (id, desfecho) => {
    const intervencoes = get().intervencoes.map((i) => (i.id === id ? { ...i, desfecho } : i));
    set({ intervencoes });
    await gravar(CHAVES.intervencoes, intervencoes);
    await cancelarFollowUp(id);

    const intervencao = intervencoes.find((i) => i.id === id);
    await enfileirar('interventions', {
      id,
      user_id: exigirPerfil(get).id,
      followup_at: new Date().toISOString(),
      outcome: desfecho,
    });

    // O ranking dos planos so aprende quando ha resposta: "sem_resposta" nao
    // conta nem a favor nem contra o plano que foi mostrado.
    if (intervencao?.planoId && desfecho !== 'sem_resposta') {
      await get().contabilizarPlano(intervencao.planoId, desfecho === 'resistiu');
    }
  },
}));

const pad = (n: number) => String(n).padStart(2, '0');

const exigirPerfil = (get: () => Estado): Perfil => {
  const { perfil } = get();
  if (!perfil) throw new Error('perfil ainda nao carregado -- chame iniciar() antes');
  return perfil;
};

const linhaDoPlano = (p: Plano, userId: string) => ({
  id: p.id,
  user_id: userId,
  trigger_condition: p.condicao,
  action: p.acao,
  category: p.categoria,
  triggers: p.gatilhos,
  times_shown: p.vezesMostrado,
  times_worked: p.vezesFuncionou,
});

export const faltamPlanos = (planos: Plano[]) => Math.max(0, MINIMO_DE_PLANOS - planos.length);
