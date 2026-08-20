"use client";

import { useActionState } from "react";
import { setMonthlyTarget, type FormState } from "@/app/(app)/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MonthlyTargetForm({
  year,
  month,
  defaultValue,
}: {
  year: number;
  month: number;
  defaultValue: number | null;
}) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(setMonthlyTarget, {});

  return (
    <form action={formAction} className="flex items-end gap-3">
      <input type="hidden" name="year" value={year} />
      <input type="hidden" name="month" value={month} />
      <div className="flex flex-1 flex-col gap-2">
        <Label htmlFor="daily_target">Tu meta diaria</Label>
        <Input
          id="daily_target"
          name="daily_target"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          defaultValue={defaultValue ?? ""}
          required
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "..." : "Guardar"}
      </Button>
      {state?.error && <p className="text-sm font-medium text-destructive">{state.error}</p>}
    </form>
  );
}
