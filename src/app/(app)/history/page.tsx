import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getFilteredTransactions, getTransactionsForMonth } from "@/lib/data/transactions";
import { getMonthDashboardData } from "@/lib/dashboard-summary";
import { monthTotals, dailyIncomeSeries, categoryTotals } from "@/lib/calc";
import type { TransactionType } from "@/lib/types/database";
import { FiltersForm } from "@/components/history/filters-form";
import { MonthComparison } from "@/components/history/month-comparison";
import { IncomeTrendChart } from "@/components/history/income-trend-chart";
import { CategorySpendingChart } from "@/components/history/category-spending-chart";
import { TransactionList } from "@/components/transactions/transaction-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function prevMonth(year: number, month: number) {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; type?: string }>;
}) {
  const { from, to, type } = await searchParams;
  const supabase = await createClient();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const previous = prevMonth(year, month);

  const validType: TransactionType | undefined =
    type === "income" || type === "expense" ? type : undefined;
  const hasFilters = Boolean(from || to || validType);

  const [filtered, currentMonthTx, previousMonthTx, dashboardData] = await Promise.all([
    hasFilters ? getFilteredTransactions(supabase, { from, to, type: validType }) : Promise.resolve(null),
    getTransactionsForMonth(supabase, year, month),
    getTransactionsForMonth(supabase, previous.year, previous.month),
    getMonthDashboardData(supabase, year, month),
  ]);

  const trend = dailyIncomeSeries(currentMonthTx, year, month);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <h1 className="text-xl font-semibold">Historial</h1>

      <MonthComparison
        current={monthTotals(currentMonthTx)}
        previous={monthTotals(previousMonthTx)}
        currentMonth={{ year, month }}
        previousMonth={previous}
      />

      <Card>
        <CardHeader>
          <CardTitle>Ingresos por día vs. meta</CardTitle>
        </CardHeader>
        <CardContent>
          <IncomeTrendChart data={trend} dailyTarget={dashboardData.summary.dailyTarget} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gastos por categoría</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <CategorySpendingChart data={categoryTotals(currentMonthTx)} />
          <Link
            href="/categories"
            className="text-center text-xs font-medium text-primary underline underline-offset-2"
          >
            Gestionar categorías y presupuestos →
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Filtrar movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <FiltersForm from={from} to={to} type={type} />
        </CardContent>
      </Card>

      {filtered && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">
            {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
          </h2>
          <TransactionList transactions={filtered} />
        </div>
      )}
    </div>
  );
}
