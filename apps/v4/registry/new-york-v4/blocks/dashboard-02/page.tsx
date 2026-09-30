"use client"

import { CircleAlertIcon } from "lucide-react"

import { ActivityTable } from "@/registry/new-york-v4/blocks/dashboard-02/components/activity-table"
import {
  AnalyticsProvider,
  useAnalytics,
} from "@/registry/new-york-v4/blocks/dashboard-02/components/analytics-provider"
import { ChannelBreakdown } from "@/registry/new-york-v4/blocks/dashboard-02/components/channel-breakdown"
import { DashboardHeader } from "@/registry/new-york-v4/blocks/dashboard-02/components/dashboard-header"
import { KpiCards } from "@/registry/new-york-v4/blocks/dashboard-02/components/kpi-cards"
import { TrendChart } from "@/registry/new-york-v4/blocks/dashboard-02/components/trend-chart"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/registry/new-york-v4/ui/alert"
import { Button } from "@/registry/new-york-v4/ui/button"
import { TooltipProvider } from "@/registry/new-york-v4/ui/tooltip"

function ErrorBanner() {
  const { status, error, refresh } = useAnalytics()

  if (status !== "error") return null

  return (
    <Alert variant="destructive" role="alert">
      <CircleAlertIcon aria-hidden="true" />
      <AlertTitle>We couldn’t load your analytics</AlertTitle>
      <AlertDescription>
        <p>{error?.message} Try again in a moment.</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={refresh}>
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  )
}

export default function Page() {
  return (
    <TooltipProvider>
      <AnalyticsProvider>
        <div className="@container/main flex min-h-svh flex-col bg-background">
          <a
            href="#dashboard-content"
            className="sr-only z-20 rounded-md bg-background px-3 py-2 text-sm font-medium focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            Skip to content
          </a>
          <DashboardHeader />
          <main
            id="dashboard-content"
            tabIndex={-1}
            className="flex flex-1 flex-col gap-4 p-4 outline-none @3xl/main:gap-6 @3xl/main:p-6 @7xl/main:p-8"
          >
            <ErrorBanner />
            <KpiCards />
            <div className="grid grid-cols-1 gap-4 @3xl/main:gap-6 @5xl/main:grid-cols-3">
              <TrendChart className="@5xl/main:col-span-2" />
              <ChannelBreakdown />
            </div>
            <ActivityTable />
          </main>
        </div>
      </AnalyticsProvider>
    </TooltipProvider>
  )
}
