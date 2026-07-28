"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; success?: number };

export async function addBill(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "");
  const dueDayRaw = String(formData.get("due_day") ?? "");

  const amount = Number(amountRaw);
  const dueDay = Number(dueDayRaw);

  if (!name) {
    return { error: "Agrega un nombre." };
  }
  if (!amount || amount <= 0) {
    return { error: "Ingresa un monto válido." };
  }
  if (!dueDay || dueDay < 1 || dueDay > 31) {
    return { error: "El día de vencimiento debe ser entre 1 y 31." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesión expirada, vuelve a iniciar sesión." };
  }

  const { error } = await supabase.from("fixed_bills").insert({
    user_id: user.id,
    name,
    amount,
    due_day: dueDay,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/bills");
  revalidatePath("/dashboard");
  return { success: Date.now() };
}

export async function deactivateBill(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("fixed_bills").update({ is_active: false }).eq("id", id);

  revalidatePath("/bills");
  revalidatePath("/dashboard");
}

export async function toggleBillPaid(formData: FormData) {
  const billId = String(formData.get("bill_id") ?? "");
  const year = Number(formData.get("year"));
  const month = Number(formData.get("month"));
  const currentlyPaid = String(formData.get("currently_paid") ?? "") === "true";

  if (!billId || !year || !month) return;

  const supabase = await createClient();

  await supabase
    .from("bill_payments")
    .upsert(
      { fixed_bill_id: billId, year, month, paid_at: currentlyPaid ? null : new Date().toISOString() },
      { onConflict: "fixed_bill_id,year,month" }
    );

  revalidatePath("/bills");
  revalidatePath("/dashboard");
}
