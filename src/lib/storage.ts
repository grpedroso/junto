import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { hasCloud, supabase } from './supabase';
import type { Tables } from '@/types/database';

export const KEYS = {
  profile: 'junto:profile',
  emas: 'junto:emas',
  plans: 'junto:plans',
  queue: 'junto:queue',
  interventions: 'junto:interventions',
  snoozed: 'junto:snoozed',
  careSeen: 'junto:care_seen',
} as const;

export async function read<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function write<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}

export const newId = () => Crypto.randomUUID();

type SyncableTable = keyof Pick<
  Tables,
  'ema_entries' | 'coping_plans' | 'interventions' | 'users'
>;

type Pending = {
  id: string;
  table: SyncableTable;
  row: Record<string, unknown>;
  createdAt: string;
};

/**
 * Offline-first is not optional here: the person may have no data exactly when
 * the crisis hits. Every write lands in the local queue first; syncing is a
 * side effect that may fail without the screen ever noticing.
 *
 * The id comes from the client and the write is an upsert, so resending the
 * same row is harmless -- that is what prevents duplicates when the network
 * comes back mid-flight.
 */
export async function enqueue(
  table: SyncableTable,
  row: Record<string, unknown>
): Promise<void> {
  if (!hasCloud) return; // local mode: nowhere to sync to
  const queue = (await read<Pending[]>(KEYS.queue)) ?? [];
  await write(KEYS.queue, [
    ...queue,
    { id: newId(), table, row, createdAt: new Date().toISOString() },
  ]);
  void flush();
}

let flushing = false;

/**
 * Returns how many items left the queue. Never throws -- being offline is the
 * normal case.
 *
 * The queue is re-read at the end and filtered by the ids that went out, rather
 * than overwritten with what remained: a new write arriving mid-flush would be
 * lost by the overwrite, and order matters because a partial upsert (the
 * follow-up, for instance) depends on the full row having gone first.
 */
export async function flush(): Promise<number> {
  if (!hasCloud || flushing) return 0;
  flushing = true;
  try {
    const queue = (await read<Pending[]>(KEYS.queue)) ?? [];
    if (queue.length === 0) return 0;

    const sent: string[] = [];
    for (const item of queue) {
      const { error } = await supabase.from(item.table).upsert(item.row as never);
      if (error) break; // keep the order: stop at the first failure
      sent.push(item.id);
    }

    if (sent.length) {
      const current = (await read<Pending[]>(KEYS.queue)) ?? [];
      await write(
        KEYS.queue,
        current.filter((i) => !sent.includes(i.id))
      );
    }
    return sent.length;
  } catch {
    return 0;
  } finally {
    flushing = false;
  }
}

export async function queueSize(): Promise<number> {
  return ((await read<Pending[]>(KEYS.queue)) ?? []).length;
}
