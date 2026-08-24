import * as SecureStore from 'expo-secure-store';
import { supabase } from './supabase';
import { limparTudo } from './storage';

const CHAVE_UUID = 'junto.uuid';

/**
 * Conta anonima: a pessoa nunca fornece email nem nome. A identidade e um UUID
 * criado pelo Supabase no primeiro acesso e guardado no SecureStore.
 *
 * Nao ha recuperacao de conta -- de proposito. Recuperar exigiria saber quem a
 * pessoa e, e nao saber e o ponto do produto. Isso esta dito no onboarding.
 */
export async function garantirSessao(): Promise<string> {
  const { data: existente } = await supabase.auth.getSession();
  if (existente.session) {
    await SecureStore.setItemAsync(CHAVE_UUID, existente.session.user.id);
    return existente.session.user.id;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    throw new Error(`nao foi possivel criar a sessao anonima: ${error?.message}`);
  }

  await SecureStore.setItemAsync(CHAVE_UUID, data.user.id);
  return data.user.id;
}

export async function uuidLocal(): Promise<string | null> {
  return SecureStore.getItemAsync(CHAVE_UUID);
}

export async function usuarioAtual(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

/**
 * Apaga tudo: servidor primeiro, depois o aparelho. Se o servidor falhar, a
 * funcao lanca e o cache local fica -- melhor a pessoa tentar de novo do que
 * ficar com dado orfao no banco que ela nao consegue mais alcancar.
 */
export async function apagarMeusDados(): Promise<void> {
  const { error } = await supabase.rpc('delete_my_data');
  if (error) throw new Error(`nao foi possivel apagar no servidor: ${error.message}`);

  await limparTudo();
  await SecureStore.deleteItemAsync(CHAVE_UUID);
  await supabase.auth.signOut();
}
