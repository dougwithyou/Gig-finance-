import { toggleWorkedToday } from "@/app/(app)/dashboard/actions";
import { Button } from "@/components/ui/button";
import type { WorkedDay } from "@/lib/types/database";

export function WorkedTodayToggle({
  date,
  workedDay,
}: {
  date: string;
  workedDay: WorkedDay | null;
}) {
  if (workedDay?.source === "inferred_from_income") {
    return <p className="text-xs text-muted-foreground">Hoy ya cuenta como trabajado (tienes un ingreso registrado).</p>;
  }

  const worked = workedDay != null;

  return (
    <form action={toggleWorkedToday} className="flex items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">
        {worked ? "Hoy está marcado como trabajado." : "¿Trabajaste hoy pero aún no registras ingreso?"}
      </p>
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="currently_worked" value={String(worked)} />
      <Button type="submit" variant={worked ? "outline" : "secondary"} size="sm">
        {worked ? "Desmarcar" : "Marcar hoy"}
      </Button>
    </form>
  );
}
