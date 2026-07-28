"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TransactionType } from "@/lib/types/database";

export type FormState = { error?: string; success?: number };

export async function addTransaction(_prev: FormState, formData: FormData): Promise<FormState> {
  const type = String(formData.get("type") ?? "") as TransactionType;
  const amountRaw = String(formData.get("amount") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const date = String(formData.get("date") ?? "");
  const sourcePlatform = String(formData.get("source_platform") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();

  const amount = Number(amountRaw);

  if (type !== "income" && type !== "expense") {
    return { error: "Tipo inválido." };
  }
  if (!amount || amount <= 0) {
    return { error: "Ingresa un monto válido." };
  }
  if (!description) {
    return { error: "Agrega una descripción." };
  }
  if (!date) {
    return { error: "Selecciona una fecha." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesión expirada, vuelve a iniciar sesión." };
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    type,
    amount,
    description,
    date,
    source_platform: type === "income" ? sourcePlatform || null : null,
    category: type === "expense" ? category || null : null,
  });

  if (error) {
    return { error: error.message };
  }

  if (type === "income") {
    // Mark this day worked, unless it's already marked (manually or from
    // an earlier income entry that day) — upsert is idempotent either way.
    await supabase
      .from("worked_days")
      .upsert(
        { user_id: user.id, date, source: "inferred_from_income" },
        { onConflict: "user_id,date", ignoreDuplicates: true }
      );
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return { success: Date.now() };
}

export async function deleteTransaction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: tx } = await supabase
    .from("transactions")
    .select("type, date")
    .eq("id", id)
    .single();

  await supabase.from("transactions").delete().eq("id", id);

  if (tx?.type === "income") {
    const { count } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("type", "income")
      .eq("date", tx.date);

    if (!count) {
      // No income left that day — remove the inferred worked-day row, but
      // never touch one the user set manually.
      await supabase
        .from("worked_days")
        .delete()
        .eq("user_id", user.id)
        .eq("date", tx.date)
        .eq("source", "inferred_from_income");
    }
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}
