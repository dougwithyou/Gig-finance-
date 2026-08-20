"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; success?: number };

/** Sets the user's own daily-target goal for a month, used by the "Proyección del mes" card. */
export async function setMonthlyTarget(_prev: FormState, formData: FormData): Promise<FormState> {
  const year = Number(formData.get("year"));
  const month = Number(formData.get("month"));
  const dailyTarget = Number(formData.get("daily_target"));

  if (!year || !month) {
    return { error: "Mes inválido." };
  }
  if (!dailyTarget || dailyTarget <= 0) {
    return { error: "Ingresa un monto válido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesión expirada, vuelve a iniciar sesión." };
  }

  const { error } = await supabase
    .from("monthly_targets")
    .upsert(
      { user_id: user.id, year, month, daily_target: dailyTarget },
      { onConflict: "user_id,year,month" }
    );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: Date.now() };
}

/** Toggles whether a (usually future) date is planned as a work day. */
export async function togglePlannedWorkDay(formData: FormData) {
  const date = String(formData.get("date") ?? "");
  const currentlyPlanned = String(formData.get("currently_planned") ?? "") === "true";
  if (!date) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (currentlyPlanned) {
    await supabase.from("planned_work_days").delete().eq("user_id", user.id).eq("date", date);
  } else {
    await supabase
      .from("planned_work_days")
      .upsert({ user_id: user.id, date }, { onConflict: "user_id,date" });
  }

  revalidatePath("/dashboard");
}

/** Manual worked-day toggle, for marking a day worked before any income is logged. */
export async function toggleWorkedToday(formData: FormData) {
  const date = String(formData.get("date") ?? "");
  const currentlyWorked = String(formData.get("currently_worked") ?? "") === "true";
  if (!date) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (currentlyWorked) {
    // Only a manual mark can be unmarked here — a day inferred from an
    // actual income entry stays worked until that transaction is deleted.
    await supabase
      .from("worked_days")
      .delete()
      .eq("user_id", user.id)
      .eq("date", date)
      .eq("source", "manual");
  } else {
    await supabase
      .from("worked_days")
      .upsert({ user_id: user.id, date, source: "manual" }, { onConflict: "user_id,date" });
  }

  revalidatePath("/dashboard");
}
