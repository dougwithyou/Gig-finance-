"use client";

import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { simulateDebtPayoff, type PayoffStrategy } from "@/lib/debt-payoff";
import { formatMoney } from "@/lib/format";
import type { CreditCard } from "@/lib/types/database";

const STRATEGY_LABEL: Record<PayoffStrategy, string> = {
  snowball: "Bola de nieve",
  avalanche: "Avalancha",
};

const STRATEGY_HINT: Record<PayoffStrategy, string> = {
  snowball: "Ataca primero la tarjeta con el saldo más chico.",
  avalanche: "Ataca primero la tarjeta con el interés más alto.",
};

export function DebtPayoffPlanner({ cards }: { cards: CreditCard[] }) {
  const [strategy, setStrategy] = useState<PayoffStrategy>("avalanche");
  const [extraMonthly, setExtraMonthly] = useState(0);

  const result = useMemo(
    () => simulateDebtPayoff(cards, strategy, extraMonthly),
    [cards, strategy, extraMonthly]
  );

  if (cards.filter((c) => c.balance > 0).length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No tienes saldo pendiente en tus tarjetas.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>Estrategia</Label>
        <Select value={strategy} onValueChange={(v) => setStrategy(v as PayoffStrategy)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(STRATEGY_LABEL) as PayoffStrategy[]).map((s) => (
              <SelectItem key={s} value={s}>
                {STRATEGY_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{STRATEGY_HINT[strategy]}</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="extra">Pago extra mensual</Label>
        <Input
          id="extra"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={extraMonthly || ""}
          onChange={(e) => setExtraMonthly(Number(e.target.value) || 0)}
          placeholder="0"
        />
      </div>

      {result.neverPaysOff ? (
        <p className="text-sm font-medium text-destructive">
          Con estos pagos no vas a salir de deuda — el interés que se acumula es mayor a lo que
          estás pagando. Prueba con un pago extra mensual.
        </p>
      ) : (
        <div className="rounded-xl border border-border bg-secondary/50 p-3 text-sm">
          <p className="font-semibold">
            Libre de deudas en {result.totalMonths} {result.totalMonths === 1 ? "mes" : "meses"}
          </p>
          <p className="text-muted-foreground">
            Pagarás un total de {formatMoney(result.totalInterestPaid)} en intereses.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-muted-foreground">Orden sugerido:</p>
        <ol className="flex flex-col gap-1 text-sm">
          {result.order.map((item, i) => (
            <li key={item.cardId} className="flex items-center justify-between">
              <span>
                {i + 1}. {item.name}
              </span>
              <span className="text-muted-foreground">
                {item.monthsToPayoff} {item.monthsToPayoff === 1 ? "mes" : "meses"}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
