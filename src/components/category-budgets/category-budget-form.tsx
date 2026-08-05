"use client";

import { useActionState, useEffect, useRef } from "react";
import { saveCategoryBudget, type FormState } from "@/app/(app)/categories/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { CategoryBudget } from "@/lib/types/database";

export function CategoryBudgetForm({
  budget,
  onSaved,
}: {
  budget?: CategoryBudget;
  onSaved?: () => void;
}) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(saveCategoryBudget, {});
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
          key={budget?.id ?? state?.success ?? "initial"}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Categoría</Label>
            {budget ? (
              <>
                <input type="hidden" name="name" value={budget.name} />
                <p className="flex h-12 items-center rounded-xl border-2 border-input bg-secondary px-4 text-base text-muted-foreground">
                  {budget.name}
                </p>
              </>
            ) : (
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Gasolina, comida, herramientas..."
                required
              />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="monthly_budget">Presupuesto mensual</Label>
            <Input
              id="monthly_budget"
              name="monthly_budget"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              defaultValue={budget?.monthly_budget}
              required
            />
          </div>
          {state?.error && <p className="text-sm font-medium text-destructive">{state.error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="lg" disabled={isPending} className="flex-1">
              {isPending ? "Guardando..." : budget ? "Guardar cambios" : "Agregar categoría"}
            </Button>
            {budget && onSaved && (
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
