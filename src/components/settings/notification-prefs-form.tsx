"use client";

import { useActionState } from "react";
import { updateNotificationPreferences, type FormState } from "@/app/(app)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { NotificationPreferences } from "@/lib/types/database";

export function NotificationPrefsForm({ prefs }: { prefs: NotificationPreferences | null }) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    updateNotificationPreferences,
    {}
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex items-center justify-between gap-3">
        <span className="text-sm">Recordatorio diario de meta</span>
        <input
          type="checkbox"
          name="daily_target_reminder_enabled"
          defaultChecked={prefs?.daily_target_reminder_enabled ?? true}
          className="h-5 w-5"
        />
      </label>

      <div className="flex flex-col gap-2">
        <Label htmlFor="bill_due_alert_days_before">Avisar de pagos fijos con cuántos días de anticipación</Label>
        <Input
          id="bill_due_alert_days_before"
          name="bill_due_alert_days_before"
          type="number"
          inputMode="numeric"
          min="0"
          max="14"
          defaultValue={prefs?.bill_due_alert_days_before ?? 3}
          required
        />
      </div>

      <label className="flex items-center justify-between gap-3">
        <span className="text-sm">Alerta de día con ingreso bajo</span>
        <input
          type="checkbox"
          name="low_income_alert_enabled"
          defaultChecked={prefs?.low_income_alert_enabled ?? true}
          className="h-5 w-5"
        />
      </label>

      <div className="flex flex-col gap-2">
        <Label htmlFor="low_income_alert_threshold_pct">
          Umbral de alerta (% de la meta diaria)
        </Label>
        <Input
          id="low_income_alert_threshold_pct"
          name="low_income_alert_threshold_pct"
          type="number"
          inputMode="numeric"
          min="0"
          max="100"
          defaultValue={prefs?.low_income_alert_threshold_pct ?? 50}
          required
        />
      </div>

      {state?.error && <p className="text-sm font-medium text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm font-medium text-positive">Guardado.</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar preferencias"}
      </Button>
    </form>
  );
}
