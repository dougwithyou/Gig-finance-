import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAuthorizedCronRequest } from "@/lib/push/cron-auth";
import { getSubscribedUserIds, sendToUser } from "@/lib/push/broadcast";
import { getMonthDashboardData } from "@/lib/dashboard-summary";
import { getNotificationPreferences } from "@/lib/data/notifications";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

// Sends: today's daily-target reminder, and a heads-up for fixed bills
// due within `bill_due_alert_days_before` days that aren't paid yet.
export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const today = now.getDate();

  const userIds = await getSubscribedUserIds(admin);
  const results: Record<string, string> = {};

  for (const userId of userIds) {
    const [prefs, { bills, summary }] = await Promise.all([
      getNotificationPreferences(admin, userId),
      getMonthDashboardData(admin, year, month, userId),
    ]);

    const daysBefore = prefs?.bill_due_alert_days_before ?? 3;
    const reminderEnabled = prefs?.daily_target_reminder_enabled ?? true;

    if (reminderEnabled && summary.dailyTarget !== null) {
      const { sent } = await sendToUser(admin, userId, {
        title: "Meta de hoy",
        body: `Necesitas generar ${formatMoney(summary.dailyTarget)} hoy para llegar a tus pagos del mes.`,
        url: "/dashboard",
      });
      results[`${userId}:target`] = `sent:${sent}`;
    }

    const dueSoon = bills.filter(
      (b) => !b.is_paid && b.due_day - today >= 0 && b.due_day - today <= daysBefore
    );

    if (dueSoon.length > 0) {
      const list = dueSoon.map((b) => `${b.name} (${formatMoney(b.amount)}, día ${b.due_day})`).join(", ");
      const { sent } = await sendToUser(admin, userId, {
        title: dueSoon.length === 1 ? "Pago por vencer" : "Pagos por vencer",
        body: list,
        url: "/bills",
      });
      results[`${userId}:bills`] = `sent:${sent}`;
    }
  }

  return NextResponse.json({ ok: true, results });
}
