import { deactivateBill, toggleBillPaid } from "@/app/(app)/bills/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { FixedBillWithStatus } from "@/lib/types/database";
import { formatMoney } from "@/lib/format";
import { X } from "lucide-react";

export function BillList({
  bills,
  year,
  month,
}: {
  bills: FixedBillWithStatus[];
  year: number;
  month: number;
}) {
  if (bills.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Todavía no tienes pagos fijos registrados.
      </p>
    );
  }

  const today = new Date().getDate();

  return (
    <div className="flex flex-col gap-2">
      {bills.map((bill) => {
        const isOverdue = !bill.is_paid && bill.due_day < today;
        return (
          <Card key={bill.id}>
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{bill.name}</span>
                <span
                  className={`text-xs ${
                    isOverdue ? "text-destructive" : "text-muted-foreground"
                  }`}
                >
                  Vence el día {bill.due_day} · {formatMoney(bill.amount)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <form action={toggleBillPaid}>
                  <input type="hidden" name="bill_id" value={bill.id} />
                  <input type="hidden" name="year" value={year} />
                  <input type="hidden" name="month" value={month} />
                  <input type="hidden" name="currently_paid" value={String(bill.is_paid)} />
                  <Button
                    type="submit"
                    size="sm"
                    variant={bill.is_paid ? "positive" : "outline"}
                  >
                    {bill.is_paid ? "Pagado" : "Marcar pagado"}
                  </Button>
                </form>
                <form action={deactivateBill}>
                  <input type="hidden" name="id" value={bill.id} />
                  <Button type="submit" variant="ghost" size="icon" aria-label="Eliminar">
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
