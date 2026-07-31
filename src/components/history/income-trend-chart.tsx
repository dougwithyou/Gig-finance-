"use client";

import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { DailyIncomePoint } from "@/lib/calc";

export function IncomeTrendChart({
  data,
  dailyTarget,
}: {
  data: DailyIncomePoint[];
  dailyTarget: number | null;
}) {
  const chartData = data.map((d) => ({ day: Number(d.date.slice(-2)), income: d.income }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dbe4ee" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: "#5b7290", fontSize: 11 }}
            axisLine={{ stroke: "#dbe4ee" }}
            tickLine={false}
            interval={2}
          />
          <YAxis
            tick={{ fill: "#5b7290", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Bar dataKey="income" fill="#16a34a" radius={[4, 4, 0, 0]} />
          {dailyTarget !== null && (
            <ReferenceLine
              y={dailyTarget}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{ value: "Meta", position: "insideTopRight", fill: "#f59e0b", fontSize: 11 }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
