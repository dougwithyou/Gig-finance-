"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatMoney } from "@/lib/format";
import type { CategoryTotal } from "@/lib/calc";

// Fixed categorical order, validated for adjacent-pair CVD separation on
// a white surface — never cycled or reordered per category.
const PALETTE = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
];
const OTHER_COLOR = "#898781";
const MAX_SLICES = PALETTE.length;

function foldIntoOther(data: CategoryTotal[]): CategoryTotal[] {
  if (data.length <= MAX_SLICES) return data;
  const kept = data.slice(0, MAX_SLICES - 1);
  const rest = data.slice(MAX_SLICES - 1);
  const otherTotal = rest.reduce((s, c) => s + c.total, 0);
  const otherPct = rest.reduce((s, c) => s + c.pct, 0);
  return [...kept, { category: "Otros", total: otherTotal, pct: otherPct }];
}

export function CategorySpendingChart({ data }: { data: CategoryTotal[] }) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Todavía no registras gastos este mes.
      </p>
    );
  }

  const slices = foldIntoOther(data);

  return (
    <div className="flex flex-col gap-2">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="total"
              nameKey="category"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={2}
              stroke="var(--card)"
              strokeWidth={2}
            >
              {slices.map((s, i) => (
                <Cell
                  key={s.category}
                  fill={s.category === "Otros" ? OTHER_COLOR : PALETTE[i % PALETTE.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [formatMoney(Number(value)), String(name)]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #dbe4ee",
                fontSize: 12,
              }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(value: string) => {
                const slice = slices.find((s) => s.category === value);
                return (
                  <span className="text-xs text-foreground">
                    {value} · {slice?.pct ?? 0}%
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
