import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlannedWorkDay, WorkedDay } from "@/lib/types/database";
import { monthBounds } from "@/lib/data/transactions";

export async function getPlannedWorkDaysForMonth(
  supabase: SupabaseClient,
  year: number,
  month: number,
  userId?: string
): Promise<PlannedWorkDay[]> {
  const { start, end } = monthBounds(year, month);
  let query = supabase.from("planned_work_days").select("*").gte("date", start).lte("date", end);
  if (userId) query = query.eq("user_id", userId);

  const { data, error } = await query.order("date", { ascending: true });

  if (error) throw error;
  return data as PlannedWorkDay[];
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
