import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Sem projeto Supabase configurado o app roda em **modo local**: conta anonima
 * criada no proprio aparelho, nada sai dali. Serve para rodar e testar antes de
 * existir backend -- o app ja e offline-first, entao a nuvem so acrescenta
 * sincronizacao.
 *
 * Lancar no import, como era antes, impedia o app de abrir: `garantirSessao`
 * tem try/catch, mas o modulo estoura antes de qualquer catch existir.
 */
export const temNuvem = Boolean(url && anonKey);

if (!temNuvem) {
  console.warn(
    '[junto] sem EXPO_PUBLIC_SUPABASE_URL/ANON_KEY -- rodando em modo local, ' +
      'nada sincroniza. Copie o .env.example para .env quando tiver o projeto.'
  );
}

/**
 * A anon key e publica por construcao -- ela vai dentro do APK. Quem protege os
 * dados e a RLS, nao o segredo da chave. Ver SECURITY.md.
 */
export const supabase = createClient<Database>(
  url ?? 'http://localhost:54321',
  anonKey ?? 'modo-local',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: temNuvem,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
