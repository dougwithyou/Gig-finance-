import type { SupabaseClient } from "@supabase/supabase-js";
import type { RecurringExpense } from "@/lib/types/database";

export async function getActiveRecurringExpenses(
  supabase: SupabaseClient
): Promise<RecurringExpense[]> {
  const { data, error } = await supabase
    .from("recurring_expenses")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as RecurringExpense[];
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Estimated monthly cost of a recurring expense, prorated from its frequency. */
export function prorateMonthly(expense: RecurringExpense, year: number, month: number): number {
  const days = daysInMonth(year, month);
  switch (expense.frequency) {
    case "daily":
      return expense.amount * days;
    case "weekly":
      return expense.amount * (days / 7);
    case "biweekly":
      return expense.amount * (days / 14);
  }
}
