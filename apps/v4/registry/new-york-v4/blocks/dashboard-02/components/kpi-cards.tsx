"use client"

import * as React from "react"
import { cn } from "cn"
import {
  InfoIcon,
  MinusIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react"
import { Area, AreaChart } from "recharts"

import { useAnalytics } from "@/registry/new-york-v4/blocks/dashboard-02/components/analytics-provider"
import { createEmptySnapshot } from "@/registry/new-york-v4/blocks/dashboard-02/lib/data"
import {
  formatKpiValue,
  getKpiDelta,
  TIMEFRAME_LABELS,
} from "@/registry/new-york-v4/blocks/dashboard-02/lib/format"
import type { Kpi } from "@/registry/new-york-v4/blocks/dashboard-02/lib/types"
import { Badge } from "@/registry/new-york-v4/ui/badge"
import { Button } from "@/registry/new-york-v4/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/new-york-v4/ui/card"
import {
  ChartContainer,
  type ChartConfig,
} from "@/registry/new-york-v4/ui/chart"
import { Skeleton } from "@/registry/new-york-v4/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/registry/new-york-v4/ui/tooltip"

// Charts are zinc steps; chart-4 reads on white, chart-1 on the dark ground.
const sparklineConfig = {
  value: {
    label: "Trend",
    theme: { light: "var(--chart-4)", dark: "var(--chart-1)" },
  },
} satisfies ChartConfig

const TREND_ICONS = {
  up: TrendingUpIcon,
  down: TrendingDownIcon,
  flat: MinusIcon,
} as const

function Sparkline({ id, values }: { id: string; values: number[] }) {
  const data = React.useMemo(
    () => values.map((value, index) => ({ index, value })),
    [values]
  )

  return (
    <ChartContainer
      config={sparklineConfig}
      aria-hidden="true"
      className="aspect-auto h-10 w-full"
      initialDimension={{ width: 240, height: 40 }}
    >
      {/* Recharts 3 enables the keyboard layer by default; a decorative
          sparkline must not become a tab stop inside aria-hidden. */}
      <AreaChart
        accessibilityLayer={false}
        tabIndex={-1}
        data={data}
        margin={{ top: 2, right: 0, bottom: 2, left: 0 }}
      >
        <defs>
          <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-value)"
              stopOpacity={0.2}
            />
            <stop
              offset="100%"
              stopColor="var(--color-value)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <Area
          dataKey="value"
          type="monotone"
          stroke="var(--color-value)"
          strokeWidth={1.5}
          fill={`url(#fill-${id})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  )
}

export function KpiCard({
  kpi,
  previousLabel,
  emptyLabel = "No data yet",
}: {
  kpi: Kpi
  previousLabel: string
  /** Shown in place of the sparkline when the KPI has no series. */
  emptyLabel?: string
}) {
  const labelId = React.useId()
  const hasData = kpi.sparkline.length > 0
  const delta = getKpiDelta(kpi)
  const TrendIcon = TREND_ICONS[delta.direction]
  const value = hasData ? formatKpiValue(kpi.value, kpi.format) : "—"

  return (
    <Card
      role="group"
      aria-labelledby={labelId}
      className="@container/card gap-4 transition-shadow hover:shadow-md"
    >
      <CardHeader>
        <CardDescription className="flex items-center gap-1">
          <span id={labelId}>{kpi.label}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-muted-foreground"
                aria-label={`About ${kpi.label.toLowerCase()}`}
              >
                <InfoIcon aria-hidden="true" className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-56">
              {kpi.description}
            </TooltipContent>
          </Tooltip>
        </CardDescription>
        <CardTitle
          // Re-keying replays the entrance animation when the value changes.
          key={value}
          className="animate-in text-2xl font-semibold tracking-tight tabular-nums duration-300 fade-in-0 slide-in-from-bottom-1 motion-reduce:animate-none @[250px]/card:text-3xl"
        >
          {value}
        </CardTitle>
        {hasData && (
          <CardAction>
            <Badge
              variant="outline"
              className={cn(
                "tabular-nums",
                delta.sentiment === "negative" && "text-destructive"
              )}
            >
              <TrendIcon aria-hidden="true" />
              {delta.label}
              <span className="sr-only">, {delta.description}</span>
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {hasData ? (
          <Sparkline id={kpi.id} values={kpi.sparkline} />
        ) : (
          <p className="flex h-10 items-center text-xs text-muted-foreground">
            {emptyLabel}
          </p>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        vs. {previousLabel}
      </CardFooter>
    </Card>
  )
}

export function KpiCardSkeleton() {
  return (
    <Card aria-hidden="true" className="gap-4">
      <CardHeader>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-36" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-10 w-full" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-3 w-32" />
      </CardFooter>
    </Card>
  )
}

export function KpiCards() {
  const { status, data, timeframe } = useAnalytics()
  const isLoading = status === "loading"
  // After a failed first load there is no snapshot; keep the labels and show
  // dashes rather than an endless skeleton.
  const kpis = React.useMemo(
    () =>
      status === "error" || !data
        ? createEmptySnapshot(timeframe).kpis
        : data.kpis,
    [status, data, timeframe]
  )

  return (
    <section
      aria-labelledby="kpi-heading"
      aria-busy={isLoading}
      className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4"
    >
      <h2 id="kpi-heading" className="sr-only">
        Key metrics
      </h2>
      {isLoading
        ? Array.from({ length: 4 }, (_, index) => (
            <KpiCardSkeleton key={index} />
          ))
        : kpis.map((kpi) => (
            <KpiCard
              key={kpi.id}
              kpi={kpi}
              previousLabel={TIMEFRAME_LABELS[timeframe].previous}
              emptyLabel={status === "error" ? "Unavailable" : undefined}
            />
          ))}
    </section>
  )
}
