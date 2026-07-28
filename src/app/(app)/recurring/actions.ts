"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { RecurringFrequency } from "@/lib/types/database";

export type FormState = { error?: string; success?: number };

const VALID_FREQUENCIES: RecurringFrequency[] = ["daily", "weekly", "biweekly"];

export async function addRecurringExpense(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "");
  const frequency = String(formData.get("frequency") ?? "") as RecurringFrequency;

  const amount = Number(amountRaw);

  if (!name) {
    return { error: "Agrega un nombre." };
  }
  if (!amount || amount <= 0) {
    return { error: "Ingresa un monto válido." };
  }
  if (!VALID_FREQUENCIES.includes(frequency)) {
    return { error: "Selecciona una frecuencia." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesión expirada, vuelve a iniciar sesión." };
  }

  const { error } = await supabase.from("recurring_expenses").insert({
    user_id: user.id,
    name,
    amount,
    frequency,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/recurring");
  revalidatePath("/dashboard");
  return { success: Date.now() };
}

export async function deactivateRecurringExpense(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("recurring_expenses").update({ is_active: false }).eq("id", id);

  revalidatePath("/recurring");
  revalidatePath("/dashboard");
}
