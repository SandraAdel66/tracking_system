"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Button } from "../ui/button";

/* ---------------- CONFIG ---------------- */

const chartConfig = {
  desktop: {
    label: "Shipments",
    color: "var(--chart-orange-default)",
  },
} satisfies ChartConfig;

/* ---------------- TYPES ---------------- */

type Scope = "all" | "mine";

type YearlyData = { month: string; desktop: number };
type MonthlyData = { period: string; desktop: number };

type ShipmentStatus = "Pending" | "In Transit" | "Delivered" | "Exception";

type Shipment = {
  id: string;
  status: ShipmentStatus;
  assignedToUserId?: string;
  createdAt?: string; // ISO
};

type Session = {
  userId: string;
  role: "admin" | "customerService" | "user";
  email: string;
  username: string;
  loginAt: string;
};

const SESSION_KEY = "pfs_session_v1";
const SHIPMENTS_KEY = "pfs_shipments_v1";

function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function readShipments(): Shipment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SHIPMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Shipment[]) : [];
  } catch {
    return [];
  }
}

/* -------- FALLBACK DATA (kept for safety) -------- */

const fallbackYearlyData: Record<number, YearlyData[]> = {
  2023: [
    { month: "January", desktop: 150 },
    { month: "February", desktop: 200 },
    { month: "March", desktop: 180 },
    { month: "April", desktop: 120 },
    { month: "May", desktop: 220 },
    { month: "June", desktop: 210 },
    { month: "July", desktop: 190 },
    { month: "August", desktop: 230 },
    { month: "September", desktop: 175 },
    { month: "October", desktop: 195 },
    { month: "November", desktop: 205 },
    { month: "December", desktop: 215 },
  ],
  2024: [
    { month: "January", desktop: 186 },
    { month: "February", desktop: 305 },
    { month: "March", desktop: 237 },
    { month: "April", desktop: 73 },
    { month: "May", desktop: 209 },
    { month: "June", desktop: 214 },
    { month: "July", desktop: 120 },
    { month: "August", desktop: 150 },
    { month: "September", desktop: 98 },
    { month: "October", desktop: 200 },
    { month: "November", desktop: 175 },
    { month: "December", desktop: 230 },
  ],
};

const fallbackMonthlyBreakdown: Record<string, MonthlyData[]> = {
  January: [
    { period: "W1", desktop: 50 },
    { period: "W2", desktop: 40 },
    { period: "W3", desktop: 55 },
    { period: "W4", desktop: 41 },
  ],
  February: [
    { period: "W1", desktop: 80 },
    { period: "W2", desktop: 70 },
    { period: "W3", desktop: 90 },
    { period: "W4", desktop: 65 },
  ],
};

/* ---------------- HELPERS ---------------- */

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
] as const;

function getMonthName(m: number) {
  return MONTHS[m] || "January";
}

// Week buckets: 1-7, 8-14, 15-21, 22+
function weekLabelFromDay(day: number): "W1" | "W2" | "W3" | "W4" {
  if (day <= 7) return "W1";
  if (day <= 14) return "W2";
  if (day <= 21) return "W3";
  return "W4";
}

function buildYearlyDataFromShipments(shipments: Shipment[], year: number): YearlyData[] {
  const counts = new Array(12).fill(0);

  for (const s of shipments) {
    if (!s.createdAt) continue;
    const d = new Date(s.createdAt);
    if (Number.isNaN(d.getTime())) continue;
    if (d.getFullYear() !== year) continue;
    counts[d.getMonth()] += 1;
  }

  return MONTHS.map((month, idx) => ({
    month,
    desktop: counts[idx] ?? 0,
  }));
}

function buildMonthlyBreakdownFromShipments(
  shipments: Shipment[],
  year: number,
  monthName: string
): MonthlyData[] {
  const monthIndex = MONTHS.findIndex((m) => m === monthName);
  if (monthIndex < 0) return [
    { period: "W1", desktop: 0 },
    { period: "W2", desktop: 0 },
    { period: "W3", desktop: 0 },
    { period: "W4", desktop: 0 },
  ];

  const buckets: Record<"W1" | "W2" | "W3" | "W4", number> = {
    W1: 0, W2: 0, W3: 0, W4: 0,
  };

  for (const s of shipments) {
    if (!s.createdAt) continue;
    const d = new Date(s.createdAt);
    if (Number.isNaN(d.getTime())) continue;
    if (d.getFullYear() !== year) continue;
    if (d.getMonth() !== monthIndex) continue;

    const w = weekLabelFromDay(d.getDate());
    buckets[w] += 1;
  }

  return [
    { period: "W1", desktop: buckets.W1 },
    { period: "W2", desktop: buckets.W2 },
    { period: "W3", desktop: buckets.W3 },
    { period: "W4", desktop: buckets.W4 },
  ];
}

/* ---------------- COMPONENT ---------------- */

export function ChartBar({ scope }: { scope: Scope }) {
  const [year, setYear] = React.useState(2024);
  const [data, setData] = React.useState<YearlyData[]>([]);
  const [selectedMonth, setSelectedMonth] = React.useState<string | null>(null);

  const years = React.useMemo(
    () => Array.from({ length: new Date().getFullYear() - 2022 }, (_, i) => 2023 + i),
    []
  );

  React.useEffect(() => {
    const session = readSession();
    const all = readShipments();

    const filtered =
      scope === "all"
        ? all
        : all.filter((s) => s.assignedToUserId && s.assignedToUserId === session?.userId);

    const yearly = buildYearlyDataFromShipments(filtered, year);

    // If there is no local data for that year, keep your fallback behavior
    const hasAny = yearly.some((x) => x.desktop > 0);
    setData(hasAny ? yearly : (fallbackYearlyData[year] || []));

    setSelectedMonth(null);
  }, [year, scope]);

  const displayedData: (YearlyData | MonthlyData)[] = selectedMonth
    ? (() => {
        const session = readSession();
        const all = readShipments();
        const filtered =
          scope === "all"
            ? all
            : all.filter((s) => s.assignedToUserId && s.assignedToUserId === session?.userId);

        const monthly = buildMonthlyBreakdownFromShipments(filtered, year, selectedMonth);
        const hasAny = monthly.some((x) => x.desktop > 0);

        return hasAny ? monthly : (fallbackMonthlyBreakdown[selectedMonth] || []);
      })()
    : data;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          {/* Left side: title */}
          <div>
            <CardTitle>Shipments Overview</CardTitle>
            <CardDescription>
              {selectedMonth ? `${selectedMonth} ${year}` : `Year ${year}`}
            </CardDescription>
          </div>

          {/* Right side: controls */}
          <div className="flex items-center gap-3">
            {/* Back button (only in drill-down mode) */}
            {selectedMonth && (
              <Button
                className=" bg-[#f26d21] hover:bg-[#f26d21]/90 font-bold"
                size="sm"
                onClick={() => setSelectedMonth(null)}
              >
                Back to Year
              </Button>
            )}

            {/* Year dropdown */}
            <Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      {/* CHART AREA */}
      <CardContent className="h-[35vh] w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={displayedData}
              onClick={(e) => {
                if (!selectedMonth && e.activePayload?.[0]?.payload?.month) {
                  setSelectedMonth(e.activePayload[0].payload.month);
                }
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={selectedMonth ? "period" : "month"}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: string) => (selectedMonth ? v : v.slice(0, 3))}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar
                dataKey="desktop"
                radius={8}
                fill="var(--color-desktop)"
                activeBar={{ fill: "var(--chart-orange-hover)" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      <CardFooter className="text-sm text-muted-foreground flex flex-col items-start gap-1">
        <div className="flex items-center gap-2 font-medium text-foreground">
          Trending up this year <TrendingUp className="h-4 w-4" />
        </div>
        Click a month to view detailed breakdown
      </CardFooter>
    </Card>
  );
}
