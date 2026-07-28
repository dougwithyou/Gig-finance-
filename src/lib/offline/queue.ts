"use client";

// Minimal IndexedDB-backed outbox for transactions logged while offline.
// Deliberately not a general sync engine — see PLAN.md: single active
// user/device, so an append-only queue flushed on reconnect is enough.

const DB_NAME = "gig-finance-offline";
const DB_VERSION = 1;
const STORE = "pending_transactions";
export const QUEUE_CHANGED_EVENT = "gig-finance:queue-changed";

function notifyQueueChanged() {
  window.dispatchEvent(new Event(QUEUE_CHANGED_EVENT));
}

export interface PendingTransaction {
  localId: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  date: string;
  source_platform: string | null;
  category: string | null;
  queued_at: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "localId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function enqueueTransaction(item: PendingTransaction): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  notifyQueueChanged();
}

export async function listPendingTransactions(): Promise<PendingTransaction[]> {
  const db = await openDb();
  const items = await new Promise<PendingTransaction[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as PendingTransaction[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return items.sort((a, b) => a.queued_at - b.queued_at);
}

export async function removePendingTransaction(localId: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(localId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  notifyQueueChanged();
}
