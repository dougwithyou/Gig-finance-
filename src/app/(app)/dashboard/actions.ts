"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string };

export async function setPlannedWorkDays(_prev: FormState, formData: FormData): Promise<FormState> {
  const year = Number(formData.get("year"));
  const month = Number(formData.get("month"));
  const plannedWorkDays = Number(formData.get("planned_work_days"));

  if (!year || !month) {
    return { error: "Mes inválido." };
  }
  if (Number.isNaN(plannedWorkDays) || plannedWorkDays < 0 || plannedWorkDays > 31) {
    return { error: "Ingresa un número de días válido (0-31)." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesión expirada, vuelve a iniciar sesión." };
  }

  const { error } = await supabase
    .from("work_day_config")
    .upsert(
      { user_id: user.id, year, month, planned_work_days: plannedWorkDays },
      { onConflict: "user_id,year,month" }
    );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return {};
}
