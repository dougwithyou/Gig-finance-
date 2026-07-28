"use client";

import { useActionState } from "react";
import { addBill, type FormState } from "@/app/(app)/bills/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function BillForm() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(addBill, {});

  return (
    <Card>
      <CardContent className="pt-5">
        <form action={formAction} key={state?.success ?? "initial"} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" type="text" placeholder="Renta, luz, internet..." required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">Monto</Label>
              <Input id="amount" name="amount" type="number" inputMode="decimal" step="0.01" min="0.01" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="due_day">Día de pago</Label>
              <Input id="due_day" name="due_day" type="number" inputMode="numeric" min="1" max="31" required />
            </div>
          </div>
          {state?.error && <p className="text-sm font-medium text-destructive">{state.error}</p>}
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? "Guardando..." : "Agregar pago fijo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
