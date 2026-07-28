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

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return { success: Date.now() };
}

export async function deleteTransaction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("transactions").delete().eq("id", id);

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}
