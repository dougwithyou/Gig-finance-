import type { SupabaseClient } from "@supabase/supabase-js";
import type { MonthlyTarget } from "@/lib/types/database";

export async function getMonthlyTarget(
  supabase: SupabaseClient,
  year: number,
  month: number,
  userId?: string
): Promise<MonthlyTarget | null> {
  let query = supabase.from("monthly_targets").select("*").eq("year", year).eq("month", month);
  if (userId) query = query.eq("user_id", userId);

  const { data, error } = await query.maybeSingle();

  if (error) throw error;
  return data as MonthlyTarget | null;
}
