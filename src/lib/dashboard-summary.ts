import type { SupabaseClient } from "@supabase/supabase-js";
import { getTransactionsForMonth, getCumulativeBalanceBefore } from "@/lib/data/transactions";
import { getFixedBillsWithStatus } from "@/lib/data/bills";
import { getCreditCardsWithStatus } from "@/lib/data/credit-cards";
import { getActiveRecurringExpenses, prorateMonthly } from "@/lib/data/recurring";
import { getPlannedWorkDaysForMonth, getWorkedDaysForMonth } from "@/lib/data/work-days";
import { getMonthlyTarget } from "@/lib/data/monthly-targets";
import { summarize } from "@/lib/calc";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * `userId` is only needed when `supabase` is the service-role admin client
 * (cron jobs) — see the note in data/transactions.ts.
 */
export async function getMonthDashboardData(
  supabase: SupabaseClient,
  year: number,
  month: number,
  userId?: string
) {
  const [
    transactions,
    bills,
    creditCards,
    recurringExpenses,
    plannedDays,
    workedDays,
    openingBalance,
    monthlyTarget,
  ] = await Promise.all([
    getTransactionsForMonth(supabase, year, month, userId),
    getFixedBillsWithStatus(supabase, year, month, userId),
    getCreditCardsWithStatus(supabase, year, month, userId),
    getActiveRecurringExpenses(supabase, userId),
    getPlannedWorkDaysForMonth(supabase, year, month, userId),
    getWorkedDaysForMonth(supabase, year, month, userId),
    getCumulativeBalanceBefore(supabase, year, month, userId),
    getMonthlyTarget(supabase, year, month, userId),
  ]);

  const recurringExpensesTotal = recurringExpenses.reduce(
    (sum, e) => sum + prorateMonthly(e, year, month),
    0
  );

  const summary = summarize(
    transactions,
    bills,
    creditCards,
    recurringExpensesTotal,
    plannedDays.map((p) => p.date),
    workedDays.map((w) => w.date),
    todayISO(),
    year,
    month,
    openingBalance
  );

  return {
    transactions,
    bills,
    creditCards,
    recurringExpenses,
    plannedDays,
    workedDays,
    monthlyTarget,
    summary,
  };
}
