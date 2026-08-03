"use client";

import { useActionState, useEffect, useRef } from "react";
import { addCreditCard, updateCreditCard, type FormState } from "@/app/(app)/credit-cards/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { CreditCard } from "@/lib/types/database";

export function CreditCardForm({
  card,
  onSaved,
}: {
  card?: CreditCard;
  onSaved?: () => void;
}) {
  const action = card ? updateCreditCard : addCreditCard;
  const [state, formAction, isPending] = useActionState<FormState, FormData>(action, {});
  const lastSuccess = useRef(state?.success);

  useEffect(() => {
    if (state?.success && state.success !== lastSuccess.current) {
      lastSuccess.current = state.success;
      onSaved?.();
    }
  }, [state?.success, onSaved]);

  return (
    <Card>
      <CardContent className="pt-5">
        <form
          action={formAction}
          key={card?.id ?? state?.success ?? "initial"}
          className="flex flex-col gap-4"
        >
          {card && <input type="hidden" name="id" value={card.id} />}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Visa, Mastercard..."
              defaultValue={card?.name}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="balance">Saldo actual</Label>
              <Input
                id="balance"
                name="balance"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                defaultValue={card?.balance}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="apr">Tasa anual (APR %)</Label>
              <Input
                id="apr"
                name="apr"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                defaultValue={card?.apr}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="minimum_payment">Pago mínimo</Label>
              <Input
                id="minimum_payment"
                name="minimum_payment"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                defaultValue={card?.minimum_payment}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="due_day">Día de pago</Label>
              <Input
                id="due_day"
                name="due_day"
                type="number"
                inputMode="numeric"
                min="1"
                max="31"
                defaultValue={card?.due_day}
                required
              />
            </div>
          </div>
          {state?.error && <p className="text-sm font-medium text-destructive">{state.error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="lg" disabled={isPending} className="flex-1">
              {isPending ? "Guardando..." : card ? "Guardar cambios" : "Agregar tarjeta"}
            </Button>
            {card && onSaved && (
              <Button type="button" variant="outline" size="lg" onClick={onSaved}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
