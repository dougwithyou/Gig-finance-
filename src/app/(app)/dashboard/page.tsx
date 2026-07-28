import { createClient } from "@/lib/supabase/server";
import { getTransactionsForMonth } from "@/lib/data/transactions";
import { getFixedBillsWithStatus } from "@/lib/data/bills";
import { getWorkDayConfig } from "@/lib/data/work-days";
import { summarize, type HealthStatus } from "@/lib/calc";
import { formatMoney } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkDaysForm } from "@/components/dashboard/work-days-form";

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

export default async function DashboardPage() {
  const supabase = await createClient();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [transactions, bills, workDayConfig] = await Promise.all([
    getTransactionsForMonth(supabase, year, month),
    getFixedBillsWithStatus(supabase, year, month),
    getWorkDayConfig(supabase, year, month),
  ]);

  const summary = summarize(transactions, bills, workDayConfig?.planned_work_days ?? null);
  const upcomingBills = bills
    .filter((b) => !b.is_paid)
    .sort((a, b) => a.due_day - b.due_day);

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
              Configura tus días de trabajo planeados para calcular tu meta diaria.
            </p>
          ) : (
            <p className="text-3xl font-bold">{formatMoney(summary.dailyTarget)}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Pagos fijos pendientes: {formatMoney(summary.unpaidBillsTotal)}
          </p>
          <div className="mt-4">
            <WorkDaysForm year={year} month={month} defaultValue={workDayConfig?.planned_work_days ?? null} />
          </div>
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
