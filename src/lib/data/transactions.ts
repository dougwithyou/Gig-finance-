import type { SupabaseClient } from "@supabase/supabase-js";
import type { Transaction, TransactionType } from "@/lib/types/database";

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

export interface TransactionFilters {
  from?: string;
  to?: string;
  type?: TransactionType;
}

export async function getFilteredTransactions(
  supabase: SupabaseClient,
  filters: TransactionFilters
): Promise<Transaction[]> {
  let query = supabase.from("transactions").select("*");

  if (filters.from) query = query.gte("date", filters.from);
  if (filters.to) query = query.lte("date", filters.to);
  if (filters.type) query = query.eq("type", filters.type);

  const { data, error } = await query
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw error;
  return data as Transaction[];
}
