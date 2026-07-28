import { deleteTransaction } from "@/app/(app)/transactions/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Transaction } from "@/lib/types/database";
import { formatMoney } from "@/lib/format";
import { X } from "lucide-react";

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es", {
    day: "2-digit",
    month: "short",
  });
}

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Todavía no hay movimientos este mes.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {transactions.map((tx) => (
        <Card key={tx.id}>
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{tx.description}</span>
              <span className="text-xs text-muted-foreground">
                {formatDate(tx.date)}
                {tx.source_platform ? ` · ${tx.source_platform}` : ""}
                {tx.category ? ` · ${tx.category}` : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`whitespace-nowrap font-semibold ${
                  tx.type === "income" ? "text-positive" : "text-destructive"
                }`}
              >
                {tx.type === "income" ? "+" : "-"}
                {formatMoney(tx.amount)}
              </span>
              <form action={deleteTransaction}>
                <input type="hidden" name="id" value={tx.id} />
                <Button type="submit" variant="ghost" size="icon" aria-label="Eliminar">
                  <X className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
