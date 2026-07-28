"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { insertTransactionClient } from "@/lib/offline/insert-transaction";
import {
  listPendingTransactions,
  removePendingTransaction,
  QUEUE_CHANGED_EVENT,
} from "@/lib/offline/queue";

export function PendingSyncBanner() {
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshCount = useCallback(async () => {
    const items = await listPendingTransactions();
    setPendingCount(items.length);
    return items;
  }, []);

  const flush = useCallback(async () => {
    const items = await refreshCount();
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    if (items.length === 0) return;

    setIsSyncing(true);
    let syncedAny = false;

    for (const { localId, type, amount, description, date, source_platform, category } of items) {
      const result = await insertTransactionClient({ type, amount, description, date, source_platform, category });
      if (result.ok) {
        await removePendingTransaction(localId);
        syncedAny = true;
      } else if (result.reason === "network") {
        break; // still offline (or connection dropped mid-flush) — stop and retry later
      }
      // "rejected" items (e.g. session expired) are left queued rather than
      // silently dropped — the user can see them still pending.
    }

    setIsSyncing(false);
    await refreshCount();
    if (syncedAny) router.refresh();
  }, [refreshCount, router]);

  useEffect(() => {
    // Syncing local component state with an external system (IndexedDB) on
    // mount, plus subscribing to its change events — the canonical valid
    // use of an effect, not derived-state-from-props.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    flush();

    const onVisible = () => {
      if (document.visibilityState === "visible") flush();
    };

    window.addEventListener("online", flush);
    window.addEventListener(QUEUE_CHANGED_EVENT, refreshCount);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.removeEventListener("online", flush);
      window.removeEventListener(QUEUE_CHANGED_EVENT, refreshCount);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (pendingCount === 0) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-warning bg-warning/10 px-4 py-3 text-sm">
      <span className="text-warning">
        {pendingCount} movimiento{pendingCount === 1 ? "" : "s"} sin sincronizar
      </span>
      <Button type="button" size="sm" variant="outline" onClick={flush} disabled={isSyncing}>
        {isSyncing ? "Sincronizando..." : "Reintentar"}
      </Button>
    </div>
  );
}
