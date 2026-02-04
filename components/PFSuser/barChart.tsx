"use client"

import { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Button } from "../ui/button"

/* ---------------- CONFIG ---------------- */

const chartConfig = {
  desktop: {
    label: "Shipments",
    color: "var(--chart-orange-default)",
  },
} satisfies ChartConfig

/* -------- FALLBACK DATA (NOT RENDERED) -------- */

type YearlyData = { month: string; desktop: number }

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
}

type MonthlyData = { period: string; desktop: number }

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
}

/* ---------------- COMPONENT ---------------- */

export function ChartBar() {
  const [year, setYear] = useState(2024)
  const [data, setData] = useState<YearlyData[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)

  const years = Array.from({ length: new Date().getFullYear() - 2022 }, (_, i) => 2023 + i)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/shipments?year=${year}`)
        if (!res.ok) throw new Error("API error")
        const json = await res.json()
        setData(json)
      } catch {
        setData(fallbackYearlyData[year] || [])
      }
      setSelectedMonth(null)
    }

    loadData()
  }, [year])

  const displayedData = selectedMonth
    ? fallbackMonthlyBreakdown[selectedMonth] || []
    : data

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
      <Select
        value={String(year)}
        onValueChange={(value) => setYear(Number(value))}
      >
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
                  setSelectedMonth(e.activePayload[0].payload.month)
                }
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={selectedMonth ? "period" : "month"}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: string) =>
                  selectedMonth ? v : v.slice(0, 3)
                }
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
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
  )
}
