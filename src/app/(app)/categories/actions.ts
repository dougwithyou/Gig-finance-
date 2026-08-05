"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; success?: number };

export async function saveCategoryBudget(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const monthlyBudget = Number(formData.get("monthly_budget"));

  if (!name) {
    return { error: "Agrega un nombre de categoría." };
  }
  if (!monthlyBudget || monthlyBudget <= 0) {
    return { error: "Ingresa un presupuesto válido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesión expirada, vuelve a iniciar sesión." };
  }

  const { error } = await supabase
    .from("category_budgets")
    .upsert(
      { user_id: user.id, name, monthly_budget: monthlyBudget, is_active: true },
      { onConflict: "user_id,name" }
    );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/categories");
  revalidatePath("/history");
  revalidatePath("/transactions");
  return { success: Date.now() };
}

export async function deactivateCategoryBudget(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("category_budgets").update({ is_active: false }).eq("id", id);

  revalidatePath("/categories");
  revalidatePath("/history");
  revalidatePath("/transactions");
}
