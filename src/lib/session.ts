import * as SecureStore from 'expo-secure-store';
import { hasCloud, supabase } from './supabase';
import { clearAll, newId } from './storage';

const UUID_KEY = 'junto.uuid';

/**
 * Anonymous account: the person never supplies an email or a name. Identity is
 * a UUID created by Supabase on first access and kept in SecureStore.
 *
 * There is no account recovery -- on purpose. Recovering would require knowing
 * who the person is, and not knowing is the point of the product. The
 * onboarding says so.
 */
export async function ensureSession(): Promise<string> {
  // Local mode: the UUID is born and dies on the device, no server involved.
  if (!hasCloud) {
    const stored = await SecureStore.getItemAsync(UUID_KEY);
    if (stored) return stored;
    const fresh = newId();
    await SecureStore.setItemAsync(UUID_KEY, fresh);
    return fresh;
  }

  const { data: existing } = await supabase.auth.getSession();
  if (existing.session) {
    await SecureStore.setItemAsync(UUID_KEY, existing.session.user.id);
    return existing.session.user.id;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    throw new Error(`could not create the anonymous session: ${error?.message}`);
  }

  await SecureStore.setItemAsync(UUID_KEY, data.user.id);
  return data.user.id;
}

export async function localUuid(): Promise<string | null> {
  return SecureStore.getItemAsync(UUID_KEY);
}

export async function currentUser(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

/**
 * Deletes everything: server first, then the device. If the server fails the
 * function throws and the local cache stays -- better the person retries than
 * ends up with orphaned rows in a database they can no longer reach.
 */
export async function deleteMyData(): Promise<void> {
  if (hasCloud) {
    const { error } = await supabase.rpc('delete_my_data');
    if (error) throw new Error(`could not delete on the server: ${error.message}`);
  }

  await clearAll();
  await SecureStore.deleteItemAsync(UUID_KEY);
  if (hasCloud) await supabase.auth.signOut();
}
