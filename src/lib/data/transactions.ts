import type { SupabaseClient } from "@supabase/supabase-js";
import type { Transaction } from "@/lib/types/database";

/** First and last calendar day of the given year/month (1-12), as ISO date strings. */
export function monthBounds(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export async function getTransactionsForMonth(
  supabase: SupabaseClient,
  year: number,
  month: number
): Promise<Transaction[]> {
  const { start, end } = monthBounds(year, month);
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Transaction[];
}

export async function getRecentTransactions(
  supabase: SupabaseClient,
  limit = 50
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Transaction[];
}
