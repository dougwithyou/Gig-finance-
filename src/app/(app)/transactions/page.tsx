import { createClient } from "@/lib/supabase/server";
import { getTransactionsForMonth } from "@/lib/data/transactions";
import { getActiveCategoryBudgets } from "@/lib/data/category-budgets";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionList } from "@/components/transactions/transaction-list";
import { PendingSyncBanner } from "@/components/transactions/pending-sync-banner";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const supabase = await createClient();
  const now = new Date();
  const [transactions, categoryBudgets] = await Promise.all([
    getTransactionsForMonth(supabase, now.getFullYear(), now.getMonth() + 1),
    getActiveCategoryBudgets(supabase),
  ]);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <h1 className="text-xl font-semibold">Registrar movimiento</h1>
      <PendingSyncBanner />
      <TransactionForm initialDate={date} categoryOptions={categoryBudgets.map((b) => b.name)} />
      <div>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Este mes</h2>
        <TransactionList transactions={transactions} />
      </div>
    </div>
  );
}
