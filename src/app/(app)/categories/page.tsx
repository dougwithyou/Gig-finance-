import { createClient } from "@/lib/supabase/server";
import { getActiveCategoryBudgets } from "@/lib/data/category-budgets";
import { getTransactionsForMonth } from "@/lib/data/transactions";
import { categoryBudgetStatuses } from "@/lib/calc";
import { CategoryBudgetForm } from "@/components/category-budgets/category-budget-form";
import { CategoryBudgetList } from "@/components/category-budgets/category-budget-list";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [budgets, transactions] = await Promise.all([
    getActiveCategoryBudgets(supabase),
    getTransactionsForMonth(supabase, year, month),
  ]);

  const statuses = categoryBudgetStatuses(transactions, budgets);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <h1 className="text-xl font-semibold">Categorías y presupuestos</h1>
      <p className="text-sm text-muted-foreground">
        Ponle un presupuesto mensual a cada categoría de gasto y mira qué tan cerca estás del
        límite. Se compara contra la categoría que escribas en cada gasto en /transactions.
      </p>
      <CategoryBudgetForm />
      <div>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Tus categorías</h2>
        <CategoryBudgetList budgets={budgets} statuses={statuses} />
      </div>
    </div>
  );
}
