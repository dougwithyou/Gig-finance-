"use client";

import { useActionState, useState } from "react";
import { addRecurringExpense, type FormState } from "@/app/(app)/recurring/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RecurringFrequency } from "@/lib/types/database";

const FREQUENCY_LABEL: Record<RecurringFrequency, string> = {
  daily: "Diario (cada día de trabajo)",
  weekly: "Semanal",
  biweekly: "Quincenal",
};

export function RecurringForm() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    addRecurringExpense,
    {}
  );
  const [frequency, setFrequency] = useState<RecurringFrequency>("daily");

  return (
    <Card>
      <CardContent className="pt-5">
        <form action={formAction} key={state?.success ?? "initial"} className="flex flex-col gap-4">
          <input type="hidden" name="frequency" value={frequency} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" type="text" placeholder="Gasolina, mandado, comida de trabajo..." required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">Monto por ocurrencia</Label>
              <Input id="amount" name="amount" type="number" inputMode="decimal" step="0.01" min="0.01" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Frecuencia</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as RecurringFrequency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(FREQUENCY_LABEL) as RecurringFrequency[]).map((f) => (
                    <SelectItem key={f} value={f}>
                      {FREQUENCY_LABEL[f]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {state?.error && <p className="text-sm font-medium text-destructive">{state.error}</p>}
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? "Guardando..." : "Agregar gasto recurrente"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
