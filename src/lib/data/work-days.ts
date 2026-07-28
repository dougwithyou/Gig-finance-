import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkDayConfig, WorkedDay } from "@/lib/types/database";
import { monthBounds } from "@/lib/data/transactions";

export async function getWorkDayConfig(
  supabase: SupabaseClient,
  year: number,
  month: number,
  userId?: string
): Promise<WorkDayConfig | null> {
  let query = supabase.from("work_day_config").select("*").eq("year", year).eq("month", month);
  if (userId) query = query.eq("user_id", userId);

  const { data, error } = await query.maybeSingle();

  if (error) throw error;
  return data as WorkDayConfig | null;
}

export async function getWorkedDaysForMonth(
  supabase: SupabaseClient,
  year: number,
  month: number,
  userId?: string
): Promise<WorkedDay[]> {
  const { start, end } = monthBounds(year, month);
  let query = supabase.from("worked_days").select("*").gte("date", start).lte("date", end);
  if (userId) query = query.eq("user_id", userId);

  const { data, error } = await query.order("date", { ascending: true });

  if (error) throw error;
  return data as WorkedDay[];
}
