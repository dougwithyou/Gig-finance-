import { createClient } from "@/lib/supabase/server";
import { getTransactionsForMonth } from "@/lib/data/transactions";
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
  const transactions = await getTransactionsForMonth(
    supabase,
    now.getFullYear(),
    now.getMonth() + 1
  );

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <h1 className="text-xl font-semibold">Registrar movimiento</h1>
      <PendingSyncBanner />
      <TransactionForm initialDate={date} />
      <div>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Este mes</h2>
        <TransactionList transactions={transactions} />
      </div>
    </div>
  );
}
