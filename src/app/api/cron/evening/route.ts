import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAuthorizedCronRequest } from "@/lib/push/cron-auth";
import { getSubscribedUserIds, sendToUser } from "@/lib/push/broadcast";
import { getTransactionsForMonth } from "@/lib/data/transactions";
import { getFixedBillsWithStatus } from "@/lib/data/bills";
import { getActiveRecurringExpenses, prorateMonthly } from "@/lib/data/recurring";
import { getWorkDayConfig, getWorkedDaysForMonth } from "@/lib/data/work-days";
import { getNotificationPreferences } from "@/lib/data/notifications";
import { summarize } from "@/lib/calc";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Compares today's logged income against what today's target was *as of
// yesterday* (obligations and remaining-days state before today's own
// income affected them) — the live dashboard figure already nets out
// today's income, which would make "you're behind today" self-correcting
// nonsense if used directly.
export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const today = todayISO();

  const userIds = await getSubscribedUserIds(admin);
  const results: Record<string, string> = {};

  for (const userId of userIds) {
    const prefs = await getNotificationPreferences(admin, userId);
    if (!(prefs?.low_income_alert_enabled ?? true)) continue;

    const [transactions, bills, recurringExpenses, workDayConfig, workedDays] = await Promise.all([
      getTransactionsForMonth(admin, year, month, userId),
      getFixedBillsWithStatus(admin, year, month, userId),
      getActiveRecurringExpenses(admin, userId),
      getWorkDayConfig(admin, year, month, userId),
      getWorkedDaysForMonth(admin, year, month, userId),
    ]);

    const recurringTotal = recurringExpenses.reduce((s, e) => s + prorateMonthly(e, year, month), 0);
    const transactionsBeforeToday = transactions.filter((t) => t.date < today);
    const workedDaysBeforeToday = workedDays.filter((w) => w.date < today).length;

    const baseline = summarize(
      transactionsBeforeToday,
      bills,
      recurringTotal,
      workDayConfig?.planned_work_days ?? null,
      workedDaysBeforeToday
    );

    if (baseline.dailyTarget === null) continue;

    const todayIncome = transactions
      .filter((t) => t.date === today && t.type === "income")
      .reduce((s, t) => s + t.amount, 0);

    const thresholdPct = prefs?.low_income_alert_threshold_pct ?? 50;
    const thresholdAmount = baseline.dailyTarget * (thresholdPct / 100);

    if (todayIncome < thresholdAmount) {
      const { sent } = await sendToUser(admin, userId, {
        title: "Ingreso de hoy por debajo de tu meta",
        body: `Generaste ${formatMoney(todayIncome)} hoy. Tu meta era ${formatMoney(baseline.dailyTarget)}.`,
        url: "/dashboard",
      });
      results[userId] = `sent:${sent}`;
    }
  }

  return NextResponse.json({ ok: true, results });
}
