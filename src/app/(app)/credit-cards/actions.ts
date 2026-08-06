"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; success?: number };

const CREDIT_CARD_PAYMENT_CATEGORY = "Pago de tarjeta de crédito";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function parseCardFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const balance = Number(formData.get("balance"));
  const apr = Number(formData.get("apr"));
  const minimumPayment = Number(formData.get("minimum_payment"));
  const dueDay = Number(formData.get("due_day"));

  if (!name) return { error: "Agrega un nombre." } as const;
  if (!Number.isFinite(balance) || balance < 0) return { error: "Ingresa un saldo válido." } as const;
  if (!Number.isFinite(apr) || apr < 0) return { error: "Ingresa una tasa de interés válida." } as const;
  if (!minimumPayment || minimumPayment <= 0) return { error: "Ingresa un pago mínimo válido." } as const;
  if (!dueDay || dueDay < 1 || dueDay > 31) return { error: "El día de pago debe ser entre 1 y 31." } as const;

  return { name, balance, apr, minimumPayment, dueDay } as const;
}

export async function addCreditCard(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = parseCardFields(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesión expirada, vuelve a iniciar sesión." };
  }

  const { error } = await supabase.from("credit_cards").insert({
    user_id: user.id,
    name: parsed.name,
    balance: parsed.balance,
    apr: parsed.apr,
    minimum_payment: parsed.minimumPayment,
    due_day: parsed.dueDay,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/credit-cards");
  revalidatePath("/dashboard");
  return { success: Date.now() };
}

export async function updateCreditCard(_prev: FormState, formData: FormData): Promise<FormState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Tarjeta inválida." };

  const parsed = parseCardFields(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("credit_cards")
    .update({
      name: parsed.name,
      balance: parsed.balance,
      apr: parsed.apr,
      minimum_payment: parsed.minimumPayment,
      due_day: parsed.dueDay,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/credit-cards");
  revalidatePath("/dashboard");
  return { success: Date.now() };
}

export async function deactivateCreditCard(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("credit_cards").update({ is_active: false }).eq("id", id);

  revalidatePath("/credit-cards");
  revalidatePath("/dashboard");
}

/**
 * Marking a card's minimum payment "paid" logs a real expense transaction
 * (category `CREDIT_CARD_PAYMENT_CATEGORY`) so it counts against
 * mtdExpenses/balance and shows up in the category breakdown — unmarking
 * it deletes that same transaction again, found via the payment row's
 * `transaction_id`.
 */
export async function toggleCreditCardPaid(formData: FormData) {
  const cardId = String(formData.get("card_id") ?? "");
  const year = Number(formData.get("year"));
  const month = Number(formData.get("month"));
  const currentlyPaid = String(formData.get("currently_paid") ?? "") === "true";

  if (!cardId || !year || !month) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (currentlyPaid) {
    const { data: existing } = await supabase
      .from("credit_card_payments")
      .select("transaction_id")
      .eq("credit_card_id", cardId)
      .eq("year", year)
      .eq("month", month)
      .maybeSingle();

    if (existing?.transaction_id) {
      await supabase.from("transactions").delete().eq("id", existing.transaction_id);
    }

    await supabase
      .from("credit_card_payments")
      .upsert(
        { credit_card_id: cardId, year, month, paid_at: null, transaction_id: null },
        { onConflict: "credit_card_id,year,month" }
      );
  } else {
    const { data: card } = await supabase
      .from("credit_cards")
      .select("name, minimum_payment")
      .eq("id", cardId)
      .single();

    if (!card) return;

    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        type: "expense",
        amount: card.minimum_payment,
        description: `Pago mínimo tarjeta ${card.name}`,
        date: todayISO(),
        category: CREDIT_CARD_PAYMENT_CATEGORY,
      })
      .select("id")
      .single();

    if (txError || !transaction) return;

    await supabase
      .from("credit_card_payments")
      .upsert(
        {
          credit_card_id: cardId,
          year,
          month,
          paid_at: new Date().toISOString(),
          transaction_id: transaction.id,
        },
        { onConflict: "credit_card_id,year,month" }
      );
  }

  revalidatePath("/credit-cards");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/history");
}
