import type { CreditCardWithStatus, FixedBillWithStatus, Transaction } from "@/lib/types/database";

export type HealthStatus = "green" | "amber" | "red";

/** The single upcoming deadline currently driving the daily target. */
export interface DailyTargetBreakdown {
  dueDate: string;
  amount: number;
  labels: string[];
}

export interface DashboardSummary {
  mtdIncome: number;
  mtdExpenses: number;
  balance: number;
  unpaidBillsTotal: number;
  unpaidMinPaymentsTotal: number;
  recurringExpensesTotal: number;
  /** planned dates (today or later) that aren't already worked. */
  remainingWorkDays: number | null;
  /** null when the user hasn't planned any work days this month yet. */
  dailyTarget: number | null;
  /** which upcoming due date is driving dailyTarget, and who's due then. */
  dailyTargetBreakdown: DailyTargetBreakdown | null;
  /** true when the planned work days before dailyTargetBreakdown's due date aren't enough to make it. */
  dailyTargetAtRisk: boolean;
  progressPct: number;
  health: HealthStatus;
}

interface Obligation {
  amount: number;
  dueDate: string;
  label: string;
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** A due-day-of-month resolved to an ISO date, clamped to `today` if it already passed. */
function resolveDueDate(year: number, month: number, day: number, today: string): string {
  const clampedDay = Math.min(day, daysInMonth(year, month));
  const date = `${year}-${String(month).padStart(2, "0")}-${String(clampedDay).padStart(2, "0")}`;
  return date < today ? today : date;
}

export function summarize(
  transactions: Transaction[],
  bills: FixedBillWithStatus[],
  creditCards: CreditCardWithStatus[],
  recurringExpensesTotal: number,
  plannedDates: string[],
  workedDates: string[],
  today: string,
  year: number,
  month: number
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
  const unpaidMinPaymentsTotal = creditCards
    .filter((c) => !c.is_paid)
    .reduce((sum, c) => sum + c.minimum_payment, 0);
  const paidMinPaymentsTotal = creditCards
    .filter((c) => c.is_paid)
    .reduce((sum, c) => sum + c.minimum_payment, 0);

  const remaining = Math.max(
    0,
    unpaidBillsTotal + unpaidMinPaymentsTotal + recurringExpensesTotal - mtdIncome
  );
  const workedSet = new Set(workedDates);
  const remainingPlannedDates = plannedDates.filter((d) => d >= today && !workedSet.has(d));
  const remainingWorkDays = plannedDates.length > 0 ? remainingPlannedDates.length : null;

  // Obligations with an actual due date drive the pace of the daily
  // target — the deadline that's hardest to make (highest amount owed
  // per remaining work day before it) wins, since meeting it covers
  // every later, less urgent deadline too.
  const obligations: Obligation[] = [
    ...bills
      .filter((b) => !b.is_paid)
      .map((b) => ({
        amount: b.amount,
        dueDate: resolveDueDate(year, month, b.due_day, today),
        label: b.name,
      })),
    ...creditCards
      .filter((c) => !c.is_paid)
      .map((c) => ({
        amount: c.minimum_payment,
        dueDate: resolveDueDate(year, month, c.due_day, today),
        label: c.name,
      })),
  ];
  if (recurringExpensesTotal > 0) {
    obligations.push({
      amount: recurringExpensesTotal,
      dueDate: resolveDueDate(year, month, daysInMonth(year, month), today),
      label: "Gastos recurrentes",
    });
  }

  const dueDates = Array.from(new Set(obligations.map((o) => o.dueDate))).sort();

  let dailyTarget = 0;
  let dailyTargetBreakdown: DailyTargetBreakdown | null = null;
  let dailyTargetAtRisk = false;

  for (const dueDate of dueDates) {
    const amountThroughDate = obligations
      .filter((o) => o.dueDate <= dueDate)
      .reduce((sum, o) => sum + o.amount, 0);
    const requiredByDate = Math.max(0, amountThroughDate - mtdIncome);
    if (requiredByDate === 0) continue;

    const workDaysByDate = remainingPlannedDates.filter((d) => d <= dueDate).length;
    const atRisk = workDaysByDate === 0;
    const pace = atRisk ? requiredByDate : requiredByDate / workDaysByDate;

    if (pace > dailyTarget) {
      dailyTarget = pace;
      dailyTargetAtRisk = atRisk;
      dailyTargetBreakdown = {
        dueDate,
        amount: amountThroughDate,
        labels: obligations.filter((o) => o.dueDate === dueDate).map((o) => o.label),
      };
    }
  }

  const totalObligations =
    unpaidBillsTotal +
    paidBillsTotal +
    unpaidMinPaymentsTotal +
    paidMinPaymentsTotal +
    recurringExpensesTotal;
  const progressPct =
    totalObligations > 0 ? Math.min(100, Math.round((mtdIncome / totalObligations) * 100)) : 100;

  const health: HealthStatus =
    remaining <= 0 ? "green" : progressPct >= 50 ? "amber" : "red";

  return {
    mtdIncome,
    mtdExpenses,
    balance: mtdIncome - mtdExpenses,
    unpaidBillsTotal,
    unpaidMinPaymentsTotal,
    recurringExpensesTotal,
    remainingWorkDays,
    dailyTarget: plannedDates.length > 0 ? dailyTarget : null,
    dailyTargetBreakdown: plannedDates.length > 0 ? dailyTargetBreakdown : null,
    dailyTargetAtRisk: plannedDates.length > 0 && dailyTargetAtRisk,
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
