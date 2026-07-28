import { deactivateRecurringExpense } from "@/app/(app)/recurring/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prorateMonthly } from "@/lib/data/recurring";
import { formatMoney } from "@/lib/format";
import type { RecurringExpense } from "@/lib/types/database";
import { X } from "lucide-react";

const FREQUENCY_LABEL: Record<RecurringExpense["frequency"], string> = {
  daily: "Diario",
  weekly: "Semanal",
  biweekly: "Quincenal",
};

export function RecurringList({
  expenses,
  year,
  month,
}: {
  expenses: RecurringExpense[];
  year: number;
  month: number;
}) {
  if (expenses.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Todavía no tienes gastos recurrentes registrados.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {expenses.map((expense) => (
        <Card key={expense.id}>
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{expense.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatMoney(expense.amount)} · {FREQUENCY_LABEL[expense.frequency]} · prorateado{" "}
                {formatMoney(prorateMonthly(expense, year, month))}/mes
              </span>
            </div>
            <form action={deactivateRecurringExpense}>
              <input type="hidden" name="id" value={expense.id} />
              <Button type="submit" variant="ghost" size="icon" aria-label="Eliminar">
                <X className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
