"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { deactivateCreditCard, toggleCreditCardPaid } from "@/app/(app)/credit-cards/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCardForm } from "@/components/credit-cards/credit-card-form";
import { estimatedMonthlyInterest } from "@/lib/data/credit-cards";
import { formatMoney } from "@/lib/format";
import type { CreditCardWithStatus } from "@/lib/types/database";

export function CreditCardList({
  cards,
  year,
  month,
}: {
  cards: CreditCardWithStatus[];
  year: number;
  month: number;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (cards.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Todavía no tienes tarjetas de crédito registradas.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {cards.map((card) => {
        if (editingId === card.id) {
          return (
            <CreditCardForm key={card.id} card={card} onSaved={() => setEditingId(null)} />
          );
        }

        return (
          <Card key={card.id}>
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{card.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Saldo {formatMoney(card.balance)} · APR {card.apr}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Mínimo {formatMoney(card.minimum_payment)} (día {card.due_day}) · Interés est.{" "}
                    {formatMoney(estimatedMonthlyInterest(card))}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Editar"
                    onClick={() => setEditingId(card.id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <form action={deactivateCreditCard}>
                    <input type="hidden" name="id" value={card.id} />
                    <Button type="submit" variant="ghost" size="icon" aria-label="Eliminar">
                      <X className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>
              <form action={toggleCreditCardPaid}>
                <input type="hidden" name="card_id" value={card.id} />
                <input type="hidden" name="year" value={year} />
                <input type="hidden" name="month" value={month} />
                <input type="hidden" name="currently_paid" value={String(card.is_paid)} />
                <Button
                  type="submit"
                  size="sm"
                  variant={card.is_paid ? "positive" : "outline"}
                  className="w-full"
                >
                  {card.is_paid ? "Pagado" : "Marcar mínimo pagado"}
                </Button>
              </form>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
