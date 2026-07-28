"use client";

import { useActionState } from "react";
import { setPlannedWorkDays, type FormState } from "@/app/(app)/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WorkDaysForm({
  year,
  month,
  defaultValue,
}: {
  year: number;
  month: number;
  defaultValue: number | null;
}) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    setPlannedWorkDays,
    {}
  );

  return (
    <form action={formAction} className="flex items-end gap-3">
      <input type="hidden" name="year" value={year} />
      <input type="hidden" name="month" value={month} />
      <div className="flex flex-1 flex-col gap-2">
        <Label htmlFor="planned_work_days">Días de trabajo planeados este mes</Label>
        <Input
          id="planned_work_days"
          name="planned_work_days"
          type="number"
          inputMode="numeric"
          min="0"
          max="31"
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
