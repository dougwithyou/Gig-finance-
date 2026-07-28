import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkDayConfig } from "@/lib/types/database";

export async function getWorkDayConfig(
  supabase: SupabaseClient,
  year: number,
  month: number
): Promise<WorkDayConfig | null> {
  const { data, error } = await supabase
    .from("work_day_config")
    .select("*")
    .eq("year", year)
    .eq("month", month)
    .maybeSingle();

  if (error) throw error;
  return data as WorkDayConfig | null;
}
