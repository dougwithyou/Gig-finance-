import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMonthDashboardData } from "@/lib/dashboard-summary";
import { dailyIncomeSeries, type HealthStatus } from "@/lib/calc";
import { formatMoney } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkedTodayToggle } from "@/components/dashboard/worked-today-toggle";
import { WorkCalendar } from "@/components/dashboard/work-calendar";

const HEALTH_LABEL: Record<HealthStatus, string> = {
  green: "Vas bien",
  amber: "Vas ajustado",
  red: "Necesitas acelerar",
};

const HEALTH_CLASS: Record<HealthStatus, string> = {
  green: "bg-positive text-positive-foreground",
  amber: "bg-warning text-warning-foreground",
  red: "bg-destructive text-destructive-foreground",
};

const MONTH_LABEL = new Intl.DateTimeFormat("es", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function prevMonth(year: number, month: number) {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}

function nextMonth(year: number, month: number) {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string }>;
}) {
  const { y, m } = await searchParams;
  const supabase = await createClient();
  const now = new Date();
  const parsedYear = Number(y);
  const parsedMonth = Number(m);
  const year = Number.isInteger(parsedYear) && parsedYear > 0 ? parsedYear : now.getFullYear();
  const month =
    Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12
      ? parsedMonth
      : now.getMonth() + 1;
  const today = todayISO();

  const { transactions, bills, plannedDays, workedDays, summary } = await getMonthDashboardData(
    supabase,
    year,
    month
  );

  const upcomingBills = bills
    .filter((b) => !b.is_paid)
    .sort((a, b) => a.due_day - b.due_day);

  const todayWorked = workedDays.find((w) => w.date === today) ?? null;
  const incomeByDate = new Map(
    dailyIncomeSeries(transactions, year, month).map((p) => [p.date, p.income])
  );
  const prev = prevMonth(year, month);
  const next = nextMonth(year, month);
  const monthLabel = MONTH_LABEL.format(new Date(Date.UTC(year, month - 1, 1)));

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Resumen del mes</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${HEALTH_CLASS[summary.health]}`}>
          {HEALTH_LABEL[summary.health]}
        </span>
      </div>

      <Card>
        <CardContent className="grid grid-cols-2 gap-4 pt-5">
          <div>
            <p className="text-xs text-muted-foreground">Balance del mes</p>
            <p className="text-2xl font-bold">{formatMoney(summary.balance)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Progreso</p>
            <p className="text-2xl font-bold">{summary.progressPct}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ingresos del mes</p>
            <p className="text-lg font-semibold text-positive">{formatMoney(summary.mtdIncome)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Gastos del mes</p>
            <p className="text-lg font-semibold text-destructive">{formatMoney(summary.mtdExpenses)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meta diaria</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.dailyTarget === null ? (
            <p className="text-sm text-muted-foreground">
              {summary.remainingWorkDays === 0
                ? "Ya no te quedan días de trabajo planeados este mes."
                : "Marca tus días de trabajo planeados en el calendario para calcular tu meta diaria."}
            </p>
          ) : (
            <p className="text-3xl font-bold">{formatMoney(summary.dailyTarget)}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Pagos fijos pendientes: {formatMoney(summary.unpaidBillsTotal)} · Gastos recurrentes
            prorateados: {formatMoney(summary.recurringExpensesTotal)}
            {summary.remainingWorkDays !== null && (
              <> · Días de trabajo restantes: {summary.remainingWorkDays}</>
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Calendario de trabajo</CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <Link
              href={`/dashboard?y=${prev.year}&m=${prev.month}`}
              className="rounded-lg px-2 py-1 text-muted-foreground hover:bg-secondary"
            >
              ←
            </Link>
            <span className="min-w-[7rem] text-center capitalize">{monthLabel}</span>
            <Link
              href={`/dashboard?y=${next.year}&m=${next.month}`}
              className="rounded-lg px-2 py-1 text-muted-foreground hover:bg-secondary"
            >
              →
            </Link>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <WorkCalendar
            year={year}
            month={month}
            today={today}
            plannedDates={plannedDays.map((p) => p.date)}
            workedDays={workedDays}
            incomeByDate={incomeByDate}
          />
          {year === now.getFullYear() && month === now.getMonth() + 1 && (
            <WorkedTodayToggle date={today} workedDay={todayWorked} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximos pagos</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingBills.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tienes pagos pendientes este mes.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {upcomingBills.map((bill) => (
                <li key={bill.id} className="flex items-center justify-between text-sm">
                  <span>
                    {bill.name} <span className="text-muted-foreground">(día {bill.due_day})</span>
                  </span>
                  <span className="font-semibold">{formatMoney(bill.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
