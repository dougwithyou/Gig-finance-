"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; success?: number };

export async function updateNotificationPreferences(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const dailyTargetReminderEnabled = formData.get("daily_target_reminder_enabled") === "on";
  const billDueAlertDaysBefore = Number(formData.get("bill_due_alert_days_before"));
  const lowIncomeAlertEnabled = formData.get("low_income_alert_enabled") === "on";
  const lowIncomeAlertThresholdPct = Number(formData.get("low_income_alert_threshold_pct"));

  if (Number.isNaN(billDueAlertDaysBefore) || billDueAlertDaysBefore < 0 || billDueAlertDaysBefore > 14) {
    return { error: "Los días de aviso deben ser entre 0 y 14." };
  }
  if (
    Number.isNaN(lowIncomeAlertThresholdPct) ||
    lowIncomeAlertThresholdPct < 0 ||
    lowIncomeAlertThresholdPct > 100
  ) {
    return { error: "El umbral debe ser un porcentaje entre 0 y 100." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesión expirada, vuelve a iniciar sesión." };
  }

  const { error } = await supabase.from("notification_preferences").upsert(
    {
      user_id: user.id,
      daily_target_reminder_enabled: dailyTargetReminderEnabled,
      bill_due_alert_days_before: billDueAlertDaysBefore,
      low_income_alert_enabled: lowIncomeAlertEnabled,
      low_income_alert_threshold_pct: lowIncomeAlertThresholdPct,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  return { success: Date.now() };
}
