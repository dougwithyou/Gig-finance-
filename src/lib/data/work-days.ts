import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkDayConfig, WorkedDay } from "@/lib/types/database";
import { monthBounds } from "@/lib/data/transactions";

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

export async function getWorkedDaysForMonth(
  supabase: SupabaseClient,
  year: number,
  month: number
): Promise<WorkedDay[]> {
  const { start, end } = monthBounds(year, month);
  const { data, error } = await supabase
    .from("worked_days")
    .select("*")
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: true });

  if (error) throw error;
  return data as WorkedDay[];
}
