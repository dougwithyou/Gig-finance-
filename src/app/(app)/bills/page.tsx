import { createClient } from "@/lib/supabase/server";
import { getFixedBillsWithStatus } from "@/lib/data/bills";
import { BillForm } from "@/components/bills/bill-form";
import { BillList } from "@/components/bills/bill-list";

export default async function BillsPage() {
  const supabase = await createClient();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const bills = await getFixedBillsWithStatus(supabase, year, month);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <h1 className="text-xl font-semibold">Pagos fijos</h1>
      <BillForm />
      <div>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Este mes</h2>
        <BillList bills={bills} year={year} month={month} />
      </div>
    </div>
  );
}
