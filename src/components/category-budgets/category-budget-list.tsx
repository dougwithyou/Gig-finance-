"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { deactivateCategoryBudget } from "@/app/(app)/categories/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryBudgetForm } from "@/components/category-budgets/category-budget-form";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import type { BudgetStatus, CategoryBudgetStatusEntry } from "@/lib/calc";
import type { CategoryBudget } from "@/lib/types/database";

const STATUS_BAR_CLASS: Record<BudgetStatus, string> = {
  under: "bg-positive",
  near: "bg-warning",
  over: "bg-destructive",
};

const STATUS_TEXT_CLASS: Record<BudgetStatus, string> = {
  under: "text-muted-foreground",
  near: "text-warning",
  over: "text-destructive",
};

export function CategoryBudgetList({
  budgets,
  statuses,
}: {
  budgets: CategoryBudget[];
  statuses: CategoryBudgetStatusEntry[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const statusByName = new Map(statuses.map((s) => [s.name, s]));

  if (budgets.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Todavía no tienes categorías con presupuesto.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {budgets.map((budget) => {
        if (editingId === budget.id) {
          return (
            <CategoryBudgetForm
              key={budget.id}
              budget={budget}
              onSaved={() => setEditingId(null)}
            />
          );
        }

        const status = statusByName.get(budget.name);
        const spent = status?.spent ?? 0;
        const pct = status?.pct ?? 0;
        const barWidth = Math.min(100, pct);
        const statusLabel: Record<BudgetStatus, string> = {
          under: `${pct}% usado`,
          near: `${pct}% usado — te estás acercando al límite`,
          over: `Te pasaste ${formatMoney(spent - budget.monthly_budget)} del presupuesto`,
        };

        return (
          <Card key={budget.id}>
            <CardContent className="flex flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{budget.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatMoney(spent)} de {formatMoney(budget.monthly_budget)}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Editar"
                    onClick={() => setEditingId(budget.id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <form action={deactivateCategoryBudget}>
                    <input type="hidden" name="id" value={budget.id} />
                    <Button type="submit" variant="ghost" size="icon" aria-label="Eliminar">
                      <X className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", STATUS_BAR_CLASS[status?.status ?? "under"])}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <span className={cn("text-xs font-medium", STATUS_TEXT_CLASS[status?.status ?? "under"])}>
                {statusLabel[status?.status ?? "under"]}
              </span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
