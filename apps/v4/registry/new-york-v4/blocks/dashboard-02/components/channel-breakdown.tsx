"use client"

import { useAnalytics } from "@/registry/new-york-v4/blocks/dashboard-02/components/analytics-provider"
import {
  formatCompact,
  TIMEFRAME_LABELS,
} from "@/registry/new-york-v4/blocks/dashboard-02/lib/format"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/new-york-v4/ui/card"
import { Progress } from "@/registry/new-york-v4/ui/progress"
import { Skeleton } from "@/registry/new-york-v4/ui/skeleton"

export function ChannelBreakdown({ className }: { className?: string }) {
  const { status, data, timeframe } = useAnalytics()
  const channels = data?.channels ?? []
  const total = channels.reduce((sum, channel) => sum + channel.revenue, 0)
  const hasData = status === "ready" && total > 0

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          <h2>Revenue by channel</h2>
        </CardTitle>
        <CardDescription>
          Share of revenue, {TIMEFRAME_LABELS[timeframe].long.toLowerCase()}.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="flex flex-col gap-5" aria-busy={status === "loading"}>
          {(channels.length
            ? channels.map((channel) => channel.channel)
            : ["Web", "Mobile app", "Marketplace"]
          ).map((name, index) => {
            const revenue = channels[index]?.revenue ?? 0
            const share = hasData ? Math.round((revenue / total) * 100) : 0

            return (
              <li key={name} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-medium">{name}</span>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {hasData
                      ? `SAR ${formatCompact(revenue)} · ${share}%`
                      : "—"}
                  </span>
                </div>
                {status === "loading" ? (
                  <Skeleton className="h-2 w-full rounded-full" />
                ) : (
                  <Progress
                    value={share}
                    aria-label={`${name} share of revenue`}
                    aria-valuetext={hasData ? `${share}%` : "No data"}
                    className="[&>[data-slot=progress-indicator]]:duration-500 motion-reduce:[&>[data-slot=progress-indicator]]:transition-none"
                  />
                )}
              </li>
            )
          })}
        </ul>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Marketplace fees are deducted before revenue is counted.
      </CardFooter>
    </Card>
  )
}
