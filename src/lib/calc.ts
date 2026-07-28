import type { FixedBillWithStatus, Transaction } from "@/lib/types/database";

export type HealthStatus = "green" | "amber" | "red";

export interface DashboardSummary {
  mtdIncome: number;
  mtdExpenses: number;
  balance: number;
  unpaidBillsTotal: number;
  recurringExpensesTotal: number;
  /** planned work days minus days already worked this month, floored at 0. */
  remainingWorkDays: number | null;
  /** null when the user hasn't set planned work days for this month yet. */
  dailyTarget: number | null;
  progressPct: number;
  health: HealthStatus;
}

export function summarize(
  transactions: Transaction[],
  bills: FixedBillWithStatus[],
  recurringExpensesTotal: number,
  plannedWorkDays: number | null,
  workedDaysCount: number
): DashboardSummary {
  const mtdIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const mtdExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const unpaidBillsTotal = bills
    .filter((b) => !b.is_paid)
    .reduce((sum, b) => sum + b.amount, 0);
  const paidBillsTotal = bills
    .filter((b) => b.is_paid)
    .reduce((sum, b) => sum + b.amount, 0);

  const remaining = Math.max(0, unpaidBillsTotal + recurringExpensesTotal - mtdIncome);
  const remainingWorkDays =
    plannedWorkDays != null ? Math.max(0, plannedWorkDays - workedDaysCount) : null;
  const dailyTarget =
    remainingWorkDays && remainingWorkDays > 0 ? remaining / remainingWorkDays : null;

  const totalObligations = unpaidBillsTotal + paidBillsTotal + recurringExpensesTotal;
  const progressPct =
    totalObligations > 0 ? Math.min(100, Math.round((mtdIncome / totalObligations) * 100)) : 100;

  const health: HealthStatus =
    remaining <= 0 ? "green" : progressPct >= 50 ? "amber" : "red";

  return {
    mtdIncome,
    mtdExpenses,
    balance: mtdIncome - mtdExpenses,
    unpaidBillsTotal,
    recurringExpensesTotal,
    remainingWorkDays,
    dailyTarget,
    progressPct,
    health,
  };
}

export interface MonthTotals {
  income: number;
  expenses: number;
  balance: number;
}

export function monthTotals(transactions: Transaction[]): MonthTotals {
  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  return { income, expenses, balance: income - expenses };
}

export interface DailyIncomePoint {
  date: string;
  income: number;
}

/** One point per calendar day of the month, income summed per day (0 if none). */
export function dailyIncomeSeries(
  transactions: Transaction[],
  year: number,
  month: number
): DailyIncomePoint[] {
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const byDate = new Map<string, number>();

  for (const t of transactions) {
    if (t.type !== "income") continue;
    byDate.set(t.date, (byDate.get(t.date) ?? 0) + t.amount);
  }

  return Array.from({ length: days }, (_, i) => {
    const day = String(i + 1).padStart(2, "0");
    const monthStr = String(month).padStart(2, "0");
    const date = `${year}-${monthStr}-${day}`;
    return { date, income: byDate.get(date) ?? 0 };
  });
}
