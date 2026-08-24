import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { supabase, temNuvem } from './supabase';
import type { Tabelas } from '@/types/database';

export const CHAVES = {
  perfil: 'junto:perfil',
  emas: 'junto:emas',
  planos: 'junto:planos',
  fila: 'junto:fila',
  intervencoes: 'junto:intervencoes',
  adiada: 'junto:adiada',
  cuidadoVisto: 'junto:cuidado_visto',
} as const;

export async function ler<T>(chave: string): Promise<T | null> {
  const bruto = await AsyncStorage.getItem(chave);
  return bruto ? (JSON.parse(bruto) as T) : null;
}

export async function gravar<T>(chave: string, valor: T): Promise<void> {
  await AsyncStorage.setItem(chave, JSON.stringify(valor));
}

export async function limparTudo(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(CHAVES));
}

export const novoId = () => Crypto.randomUUID();

type TabelaSincronizavel = keyof Pick<
  Tabelas,
  'ema_entries' | 'coping_plans' | 'interventions' | 'users'
>;

type Pendente = {
  id: string;
  tabela: TabelaSincronizavel;
  linha: Record<string, unknown>;
  criadoEm: string;
};

/**
 * Offline-first nao e opcional aqui: a pessoa pode estar sem dados justamente
 * no momento de crise. Toda escrita cai na fila local primeiro; a sincronizacao
 * e um efeito colateral que pode falhar sem que a tela perceba.
 *
 * O id vem do cliente e a escrita e upsert, entao reenviar a mesma linha e
 * inofensivo -- e o que evita duplicata quando a rede volta no meio do caminho.
 */
export async function enfileirar(
  tabela: TabelaSincronizavel,
  linha: Record<string, unknown>
): Promise<void> {
  if (!temNuvem) return; // modo local: nao ha para onde sincronizar
  const fila = (await ler<Pendente[]>(CHAVES.fila)) ?? [];
  await gravar(CHAVES.fila, [
    ...fila,
    { id: novoId(), tabela, linha, criadoEm: new Date().toISOString() },
  ]);
  void descarregar();
}

let descarregando = false;

/**
 * Retorna quantos itens sairam da fila. Nunca lanca -- sem rede e o normal.
 *
 * A fila e relida no fim e filtrada pelo id do que saiu, em vez de sobrescrita
 * com o que sobrou: uma escrita nova que chegue durante o envio seria perdida
 * pela sobrescrita, e a ordem importa porque um upsert parcial (o follow-up,
 * por exemplo) depende da linha completa ter passado antes.
 */
export async function descarregar(): Promise<number> {
  if (!temNuvem || descarregando) return 0;
  descarregando = true;
  try {
    const fila = (await ler<Pendente[]>(CHAVES.fila)) ?? [];
    if (fila.length === 0) return 0;

    const enviados: string[] = [];
    for (const item of fila) {
      const { error } = await supabase.from(item.tabela).upsert(item.linha as never);
      if (error) break; // manter a ordem: parar no primeiro que falhar
      enviados.push(item.id);
    }

    if (enviados.length) {
      const atual = (await ler<Pendente[]>(CHAVES.fila)) ?? [];
      await gravar(
        CHAVES.fila,
        atual.filter((i) => !enviados.includes(i.id))
      );
    }
    return enviados.length;
  } catch {
    return 0;
  } finally {
    descarregando = false;
  }
}

export async function tamanhoDaFila(): Promise<number> {
  return ((await ler<Pendente[]>(CHAVES.fila)) ?? []).length;
}
