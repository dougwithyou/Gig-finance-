import type { FixedBillWithStatus, Transaction } from "@/lib/types/database";

export type HealthStatus = "green" | "amber" | "red";

export interface DashboardSummary {
  mtdIncome: number;
  mtdExpenses: number;
  balance: number;
  unpaidBillsTotal: number;
  /** null when the user hasn't set planned work days for this month yet. */
  dailyTarget: number | null;
  progressPct: number;
  health: HealthStatus;
}

export function summarize(
  transactions: Transaction[],
  bills: FixedBillWithStatus[],
  plannedWorkDays: number | null
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

  const remaining = Math.max(0, unpaidBillsTotal - mtdIncome);
  const dailyTarget =
    plannedWorkDays && plannedWorkDays > 0 ? remaining / plannedWorkDays : null;

  const totalObligations = unpaidBillsTotal + bills.filter((b) => b.is_paid).reduce((s, b) => s + b.amount, 0);
  const progressPct =
    totalObligations > 0 ? Math.min(100, Math.round((mtdIncome / totalObligations) * 100)) : 100;

  const health: HealthStatus =
    remaining <= 0 ? "green" : progressPct >= 50 ? "amber" : "red";

  return {
    mtdIncome,
    mtdExpenses,
    balance: mtdIncome - mtdExpenses,
    unpaidBillsTotal,
    dailyTarget,
    progressPct,
    health,
  };
}
