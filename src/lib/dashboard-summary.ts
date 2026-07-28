import type { SupabaseClient } from "@supabase/supabase-js";
import { getTransactionsForMonth } from "@/lib/data/transactions";
import { getFixedBillsWithStatus } from "@/lib/data/bills";
import { getActiveRecurringExpenses, prorateMonthly } from "@/lib/data/recurring";
import { getWorkDayConfig, getWorkedDaysForMonth } from "@/lib/data/work-days";
import { summarize } from "@/lib/calc";

export async function getMonthDashboardData(supabase: SupabaseClient, year: number, month: number) {
  const [transactions, bills, recurringExpenses, workDayConfig, workedDays] = await Promise.all([
    getTransactionsForMonth(supabase, year, month),
    getFixedBillsWithStatus(supabase, year, month),
    getActiveRecurringExpenses(supabase),
    getWorkDayConfig(supabase, year, month),
    getWorkedDaysForMonth(supabase, year, month),
  ]);

  const recurringExpensesTotal = recurringExpenses.reduce(
    (sum, e) => sum + prorateMonthly(e, year, month),
    0
  );

  const summary = summarize(
    transactions,
    bills,
    recurringExpensesTotal,
    workDayConfig?.planned_work_days ?? null,
    workedDays.length
  );

  return { transactions, bills, recurringExpenses, workDayConfig, workedDays, summary };
}
