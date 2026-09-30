"use client"

import * as React from "react"
import { cn } from "cn"
import { DownloadIcon, RefreshCwIcon } from "lucide-react"

import { useAnalytics } from "@/registry/new-york-v4/blocks/dashboard-02/components/analytics-provider"
import {
  formatKpiValue,
  getKpiDelta,
  TIMEFRAME_LABELS,
  toActivityCsv,
} from "@/registry/new-york-v4/blocks/dashboard-02/lib/format"
import {
  isTimeframe,
  TIMEFRAMES,
} from "@/registry/new-york-v4/blocks/dashboard-02/lib/types"
import { Button } from "@/registry/new-york-v4/ui/button"
import { Spinner } from "@/registry/new-york-v4/ui/spinner"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/registry/new-york-v4/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/registry/new-york-v4/ui/tooltip"

export function TimeframeToggle({ className }: { className?: string }) {
  const { timeframe, setTimeframe } = useAnalytics()

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      value={timeframe}
      // Radix emits "" when the pressed item is clicked again; a timeframe is
      // always required, so ignore it.
      onValueChange={(value) => isTimeframe(value) && setTimeframe(value)}
      aria-label="Timeframe"
      className={className}
    >
      {TIMEFRAMES.map((value) => (
        <ToggleGroupItem
          key={value}
          value={value}
          aria-label={TIMEFRAME_LABELS[value].long}
          className="flex-1 px-3 tabular-nums transition-colors"
        >
          {TIMEFRAME_LABELS[value].short}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

function DashboardSummary() {
  const { status, data, timeframe } = useAnalytics()
  const labels = TIMEFRAME_LABELS[timeframe]
  const revenue = data?.kpis.find((kpi) => kpi.id === "revenue")

  let summary = "Refreshing…"
  if (status === "error") {
    summary = "Data unavailable"
  } else if (status === "ready" && revenue) {
    summary =
      revenue.value === 0
        ? "No activity recorded"
        : `${formatKpiValue(revenue.value, revenue.format)} revenue, ${
            getKpiDelta(revenue).label
          } vs. ${labels.previous}`
  }

  return (
    <p
      role="status"
      aria-live="polite"
      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground"
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-2 rounded-full bg-foreground transition-opacity",
          status === "loading" && "animate-pulse motion-reduce:animate-none",
          status === "error" && "bg-destructive"
        )}
      />
      <span className="font-medium text-foreground">{labels.long}</span>
      <span aria-hidden="true">·</span>
      <span className="tabular-nums">{summary}</span>
    </p>
  )
}

export function DashboardHeader() {
  const { status, data, refresh, timeframe } = useAnalytics()
  const isLoading = status === "loading"
  const canExport = status === "ready" && !!data?.activity.length

  const handleExport = React.useCallback(() => {
    if (!data) return
    const blob = new Blob([toActivityCsv(data.activity)], {
      type: "text/csv;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `activity-${timeframe}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [data, timeframe])

  return (
    <header className="sticky top-0 z-10 flex flex-col gap-3 border-b bg-background/85 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 @3xl/main:px-6 @7xl/main:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground">Analytics</p>
          <h1 className="truncate text-2xl font-semibold tracking-tight">
            Overview
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <TimeframeToggle className="hidden @3xl/main:flex" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={refresh}
                disabled={isLoading}
                aria-label="Refresh data"
                className="@3xl/main:w-auto @3xl/main:px-3"
              >
                {isLoading ? (
                  <Spinner aria-hidden="true" role="presentation" />
                ) : (
                  <RefreshCwIcon aria-hidden="true" />
                )}
                <span className="hidden @3xl/main:inline">Refresh</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reload the latest numbers</TooltipContent>
          </Tooltip>
          <Button
            size="icon"
            onClick={handleExport}
            disabled={!canExport}
            aria-label="Export activity as CSV"
            className="@3xl/main:w-auto @3xl/main:px-4"
          >
            <DownloadIcon aria-hidden="true" />
            <span className="hidden @3xl/main:inline">Export</span>
          </Button>
        </div>
      </div>
      <TimeframeToggle className="w-full @3xl/main:hidden" />
      <DashboardSummary />
    </header>
  )
}
