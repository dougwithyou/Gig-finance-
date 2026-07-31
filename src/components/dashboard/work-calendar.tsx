import Link from "next/link";
import { togglePlannedWorkDay } from "@/app/(app)/dashboard/actions";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { WorkedDay } from "@/lib/types/database";

const WEEKDAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

const cellClass =
  "flex h-11 w-full flex-col items-center justify-center rounded-lg text-xs font-medium transition-colors";

export function WorkCalendar({
  year,
  month,
  today,
  plannedDates,
  workedDays,
  incomeByDate,
}: {
  year: number;
  month: number;
  today: string;
  plannedDates: string[];
  workedDays: WorkedDay[];
  incomeByDate: Map<string, number>;
}) {
  const plannedSet = new Set(plannedDates);
  const workedSet = new Set(workedDays.map((w) => w.date));

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const leadingBlanks = (firstWeekday + 6) % 7; // Monday-first grid

  const cells: (string | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${year}-${pad(month)}-${pad(i + 1)}`),
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {WEEKDAY_LABELS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`blank-${i}`} />;

          const isWorked = workedSet.has(date);
          const isPlanned = plannedSet.has(date);
          const isFuture = date > today;
          const isToday = date === today;
          const income = incomeByDate.get(date) ?? 0;
          const dayNumber = Number(date.slice(-2));

          const stateClass = isWorked
            ? "bg-positive text-positive-foreground"
            : isPlanned
              ? "border-2 border-primary text-primary"
              : "bg-secondary text-secondary-foreground";

          if (isFuture) {
            return (
              <form key={date} action={togglePlannedWorkDay}>
                <input type="hidden" name="date" value={date} />
                <input type="hidden" name="currently_planned" value={String(isPlanned)} />
                <button
                  type="submit"
                  title={isPlanned ? "Planeado — toca para quitar" : "Toca para planear este día"}
                  className={cn(cellClass, stateClass)}
                >
                  <span>{dayNumber}</span>
                </button>
              </form>
            );
          }

          return (
            <Link
              key={date}
              href={`/transactions?date=${date}`}
              title={
                isWorked
                  ? `Trabajado — ingreso registrado: ${formatMoney(income)}`
                  : "Toca para registrar cuánto generaste"
              }
              className={cn(cellClass, stateClass, isToday && "ring-2 ring-ring")}
            >
              <span>{dayNumber}</span>
              {isWorked && income > 0 && (
                <span className="text-[10px] leading-none">{Math.round(income)}</span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-positive" /> Trabajado
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded border-2 border-primary" /> Planeado
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-secondary" /> Sin marcar
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        Días futuros: toca para planear que vas a trabajar. Hoy o días pasados: toca para
        registrar cuánto generaste ese día.
      </p>
    </div>
  );
}
