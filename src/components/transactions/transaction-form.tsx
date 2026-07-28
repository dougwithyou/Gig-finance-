"use client";

import { useActionState, useState } from "react";
import { addTransaction, type FormState } from "@/app/(app)/transactions/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/lib/types/database";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionForm() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    addTransaction,
    {}
  );
  const [type, setType] = useState<TransactionType>("income");

  return (
    <Card>
      <CardContent className="pt-5">
        <form
          action={formAction}
          key={state?.success ?? "initial"}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="type" value={type} />
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("income")}
              className={cn(
                "h-12 rounded-xl text-base font-semibold transition-colors",
                type === "income"
                  ? "bg-positive text-positive-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              Ingreso
            </button>
            <button
              type="button"
              onClick={() => setType("expense")}
              className={cn(
                "h-12 rounded-xl text-base font-semibold transition-colors",
                type === "expense"
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              Gasto
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Input id="description" name="description" type="text" required />
          </div>

          {type === "income" ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="source_platform">Plataforma (opcional)</Label>
              <Input id="source_platform" name="source_platform" type="text" placeholder="Uber, DoorDash, cliente..." />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Categoría (opcional)</Label>
              <Input id="category" name="category" type="text" placeholder="Gasolina, comida, herramientas..." />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Fecha</Label>
            <Input id="date" name="date" type="date" defaultValue={todayISO()} required />
          </div>

          {state?.error && <p className="text-sm font-medium text-destructive">{state.error}</p>}

          <Button type="submit" size="lg" variant={type === "income" ? "positive" : "destructive"} disabled={isPending}>
            {isPending ? "Guardando..." : type === "income" ? "Agregar ingreso" : "Agregar gasto"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
