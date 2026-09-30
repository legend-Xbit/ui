"use client"

import * as React from "react"
import { cn } from "cn"
import { ChartLineIcon } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { useAnalytics } from "@/registry/new-york-v4/blocks/dashboard-02/components/analytics-provider"
import {
  SectionEmpty,
  SectionError,
} from "@/registry/new-york-v4/blocks/dashboard-02/components/section-state"
import {
  formatCompact,
  formatCurrency,
  formatNumber,
  TIMEFRAME_LABELS,
} from "@/registry/new-york-v4/blocks/dashboard-02/lib/format"
import type { TrendMetric } from "@/registry/new-york-v4/blocks/dashboard-02/lib/types"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/new-york-v4/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/registry/new-york-v4/ui/chart"
import { Skeleton } from "@/registry/new-york-v4/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/registry/new-york-v4/ui/tabs"

// Neighbouring series sit on distant zinc steps, and the previous period is
// also dashed so the two never rely on lightness alone.
const chartConfig = {
  current: {
    label: "This period",
    theme: { light: "var(--chart-4)", dark: "var(--chart-1)" },
  },
  previous: {
    label: "Previous period",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

const METRICS: Record<
  TrendMetric,
  { title: string; format: (value: number) => string }
> = {
  revenue: { title: "Revenue over time", format: (v) => formatCurrency(v) },
  orders: { title: "Orders over time", format: (v) => formatNumber(v) },
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])

  return reduced
}

export function TrendChart({ className }: { className?: string }) {
  const { status, data, timeframe, refresh } = useAnalytics()
  const [metric, setMetric] = React.useState<TrendMetric>("revenue")
  const reducedMotion = usePrefersReducedMotion()
  const descriptionId = React.useId()
  const { title, format } = METRICS[metric]

  const chartData = React.useMemo(
    () =>
      (data?.series ?? []).map((point) => ({
        label: point.label,
        current: metric === "revenue" ? point.revenue : point.orders,
        previous:
          metric === "revenue" ? point.revenuePrevious : point.ordersPrevious,
      })),
    [data, metric]
  )

  return (
    <Card className={cn("@container/chart", className)}>
      <CardHeader>
        <CardTitle>
          <h2>{title}</h2>
        </CardTitle>
        <CardDescription id={descriptionId}>
          {TIMEFRAME_LABELS[timeframe].long} against the{" "}
          {TIMEFRAME_LABELS[timeframe].previous}. Focus the chart and use the
          arrow keys to read each point.
        </CardDescription>
        <CardAction>
          <Tabs
            value={metric}
            onValueChange={(value) => setMetric(value as TrendMetric)}
          >
            <TabsList aria-label="Chart metric">
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 @md/chart:px-6">
        {status === "loading" ? (
          <Skeleton aria-hidden="true" className="h-[250px] w-full" />
        ) : status === "error" ? (
          <SectionError
            title="Chart unavailable"
            onRetry={refresh}
            className="h-[250px]"
          />
        ) : chartData.length === 0 ? (
          <SectionEmpty
            icon={ChartLineIcon}
            title="No data for this period"
            description="Revenue appears here after your first order."
            className="h-[250px]"
          />
        ) : (
          <ChartContainer
            config={chartConfig}
            aria-describedby={descriptionId}
            className="aspect-auto h-[250px] w-full rounded-lg has-[.recharts-surface:focus-visible]:ring-[3px] has-[.recharts-surface:focus-visible]:ring-ring/50"
          >
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="fill-current" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-current)"
                    stopOpacity={0.24}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-current)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
              />
              <YAxis
                width={48}
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                tickFormatter={(value: number) => formatCompact(value)}
                className="font-mono tabular-nums"
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="text-muted-foreground">
                          {chartConfig[name as keyof typeof chartConfig]
                            ?.label ?? name}
                        </span>
                        <span className="font-mono font-medium tabular-nums">
                          {format(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              {/* Draw order is tooltip and legend order: current period first. */}
              <Area
                dataKey="current"
                type="monotone"
                stroke="var(--color-current)"
                strokeWidth={2}
                fill="url(#fill-current)"
                isAnimationActive={!reducedMotion}
                animationDuration={400}
              />
              <Area
                dataKey="previous"
                type="monotone"
                stroke="var(--color-previous)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
                isAnimationActive={!reducedMotion}
                animationDuration={400}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
