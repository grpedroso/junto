import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * With no Supabase project configured the app runs in **local mode**: the
 * anonymous account is created on the device and nothing leaves it. That is
 * enough to run and test before a backend exists -- the app is already
 * offline-first, so the cloud only adds synchronisation.
 *
 * Throwing at import time, as this did before, stopped the app from opening at
 * all: `ensureSession` has a try/catch, but the module blew up before any catch
 * existed.
 */
export const hasCloud = Boolean(url && anonKey);

if (!hasCloud) {
  console.warn(
    '[junto] no EXPO_PUBLIC_SUPABASE_URL/ANON_KEY -- running in local mode, ' +
      'nothing syncs. Copy .env.example to .env once the project exists.'
  );
}

/**
 * The anon key is public by design -- it ships inside the APK. What protects
 * the data is RLS, not the secrecy of the key. See SECURITY.md.
 */
export const supabase = createClient<Database>(
  url ?? 'http://localhost:54321',
  anonKey ?? 'local-mode',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: hasCloud,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
