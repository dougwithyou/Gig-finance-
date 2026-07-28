import type { SupabaseClient } from "@supabase/supabase-js";
import type { BillPayment, FixedBill, FixedBillWithStatus } from "@/lib/types/database";

export async function getFixedBillsWithStatus(
  supabase: SupabaseClient,
  year: number,
  month: number,
  userId?: string
): Promise<FixedBillWithStatus[]> {
  let billsQuery = supabase.from("fixed_bills").select("*").eq("is_active", true);
  if (userId) billsQuery = billsQuery.eq("user_id", userId);

  const { data: bills, error: billsError } = await billsQuery.order("due_day", { ascending: true });

  if (billsError) throw billsError;

  const billIds = (bills as FixedBill[]).map((b) => b.id);
  let payments: BillPayment[] = [];

  if (billIds.length > 0) {
    const { data, error } = await supabase
      .from("bill_payments")
      .select("*")
      .in("fixed_bill_id", billIds)
      .eq("year", year)
      .eq("month", month);

    if (error) throw error;
    payments = data as BillPayment[];
  }

  return (bills as FixedBill[]).map((bill) => {
    const payment = payments.find((p) => p.fixed_bill_id === bill.id) ?? null;
    return {
      ...bill,
      payment,
      is_paid: payment?.paid_at != null,
    };
  });
}
