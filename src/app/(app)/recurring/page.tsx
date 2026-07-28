import { createClient } from "@/lib/supabase/server";
import { getActiveRecurringExpenses, prorateMonthly } from "@/lib/data/recurring";
import { RecurringForm } from "@/components/recurring/recurring-form";
import { RecurringList } from "@/components/recurring/recurring-list";
import { formatMoney } from "@/lib/format";

export default async function RecurringPage() {
  const supabase = await createClient();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const expenses = await getActiveRecurringExpenses(supabase);
  const totalProrated = expenses.reduce((sum, e) => sum + prorateMonthly(e, year, month), 0);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <h1 className="text-xl font-semibold">Gastos recurrentes</h1>
      <p className="text-sm text-muted-foreground">
        Gastos que se repiten seguido pero no son un pago fijo con fecha exacta (gasolina,
        comida de trabajo, mandado). Se prorratean automáticamente al cálculo mensual.
      </p>
      <RecurringForm />
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Activos</h2>
          <span className="text-sm font-semibold">{formatMoney(totalProrated)}/mes</span>
        </div>
        <RecurringList expenses={expenses} year={year} month={month} />
      </div>
    </div>
  );
}
