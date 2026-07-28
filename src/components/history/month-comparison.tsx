import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import type { MonthTotals } from "@/lib/calc";

const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function MonthColumn({ label, totals }: { label: string; totals: MonthTotals }) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm text-positive">+{formatMoney(totals.income)}</p>
      <p className="text-sm text-destructive">-{formatMoney(totals.expenses)}</p>
      <p className="text-sm font-semibold">{formatMoney(totals.balance)}</p>
    </div>
  );
}

export function MonthComparison({
  current,
  previous,
  currentMonth,
  previousMonth,
}: {
  current: MonthTotals;
  previous: MonthTotals;
  currentMonth: { year: number; month: number };
  previousMonth: { year: number; month: number };
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Este mes vs. el anterior</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-6">
        <MonthColumn label={MONTH_NAMES[previousMonth.month - 1]} totals={previous} />
        <MonthColumn label={MONTH_NAMES[currentMonth.month - 1]} totals={current} />
      </CardContent>
    </Card>
  );
}
