const QUEUE_KEY = 'swasthya_offline_intake_queue';

export interface OfflineIntakeItem {
  client_idempotency_key: string;
  symptom_text_raw: string;
  patient: {
    display_name: string;
    age_years?: number | null;
    sex?: string | null;
    village?: string | null;
  };
  queued_at: string;
}

export function loadOfflineQueue(): OfflineIntakeItem[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOfflineQueue(items: OfflineIntakeItem[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export function enqueueOfflineIntake(
  item: Omit<OfflineIntakeItem, 'queued_at' | 'client_idempotency_key'> & {
    client_idempotency_key?: string;
  },
): OfflineIntakeItem {
  const entry: OfflineIntakeItem = {
    client_idempotency_key: item.client_idempotency_key || crypto.randomUUID(),
    symptom_text_raw: item.symptom_text_raw,
    patient: item.patient,
    queued_at: new Date().toISOString(),
  };
  const q = loadOfflineQueue();
  q.push(entry);
  saveOfflineQueue(q);
  return entry;
}

export function clearAcceptedKeys(keys: string[]): void {
  const set = new Set(keys);
  const next = loadOfflineQueue().filter((i) => !set.has(i.client_idempotency_key));
  saveOfflineQueue(next);
}

export function pendingCount(): number {
  return loadOfflineQueue().length;
}
