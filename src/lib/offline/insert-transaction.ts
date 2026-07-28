"use client";

import { createClient } from "@/lib/supabase/client";
import type { PendingTransaction } from "@/lib/offline/queue";

export type InsertResult =
  | { ok: true }
  | { ok: false; reason: "network" }
  | { ok: false; reason: "rejected"; message: string };

/**
 * Client-side insert (transaction row + worked_days upsert for income).
 * Runs from the browser, not a server action, so it can be attempted
 * while offline and its failure mode inspected — used both for the normal
 * online path and for flushing the offline outbox, so both go through the
 * same code and can't drift apart.
 */
export async function insertTransactionClient(
  item: Omit<PendingTransaction, "localId" | "queued_at">
): Promise<InsertResult> {
  const supabase = createClient();

  let userId: string | undefined;
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    userId = session?.user.id;
  } catch {
    return { ok: false, reason: "network" };
  }

  if (!userId) {
    return { ok: false, reason: "rejected", message: "Sesión expirada, vuelve a iniciar sesión." };
  }

  try {
    const { error } = await supabase.from("transactions").insert({
      user_id: userId,
      type: item.type,
      amount: item.amount,
      description: item.description,
      date: item.date,
      source_platform: item.source_platform,
      category: item.category,
    });

    if (error) {
      return { ok: false, reason: "rejected", message: error.message };
    }

    if (item.type === "income") {
      await supabase
        .from("worked_days")
        .upsert(
          { user_id: userId, date: item.date, source: "inferred_from_income" },
          { onConflict: "user_id,date", ignoreDuplicates: true }
        );
    }

    return { ok: true };
  } catch {
    // A thrown (rather than returned) error here means the fetch itself
    // failed — no connectivity — as opposed to the server rejecting the
    // request. That distinction is what decides queue-for-later vs. show
    // the user a real error.
    return { ok: false, reason: "network" };
  }
}
