"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatNumber } from "@/lib/utils";
import { wordUsageSeries } from "@/lib/mock-data";

export function StatsFooter() {
  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-3">
      <Card>
        <CardContent className="p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Total Words
          </p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            {formatNumber(10_134_672)}
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Lifetime generation across your workspace
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Words Used
            </p>
            <Badge>72% of quota</Badge>
          </div>
          <p className="mt-3 text-3xl font-semibold text-white">1,842,110</p>
          <div className="mt-4 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={wordUsageSeries}>
                <defs>
                  <linearGradient id="words" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4d00" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#ff4d00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#141418",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="words"
                  stroke="#ff4d00"
                  fill="url(#words)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-glow">
        <CardContent className="p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Current Plan
          </p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-4xl font-semibold text-white">Pro</p>
            <Badge variant="success">Active</Badge>
          </div>
          <p className="mt-2 text-sm text-zinc-500">
            2,500,000 words / month · Aura Chat included
          </p>
          <Progress value={72} className="mt-5" />
          <p className="mt-2 text-xs text-zinc-500">
            Resets in 18 days
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
