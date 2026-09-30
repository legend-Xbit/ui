export const TIMEFRAMES = ["24h", "7d", "30d"] as const

export type Timeframe = (typeof TIMEFRAMES)[number]

export function isTimeframe(value: string): value is Timeframe {
  return (TIMEFRAMES as readonly string[]).includes(value)
}

export type KpiFormat = "currency" | "number" | "percent"

export type Kpi = {
  id: "revenue" | "active-users" | "conversion-rate" | "churn-rate"
  label: string
  description: string
  format: KpiFormat
  value: number
  previous: number
  higherIsBetter: boolean
  sparkline: number[]
}

export type TrendMetric = "revenue" | "orders"

export type SeriesPoint = {
  label: string
  revenue: number
  revenuePrevious: number
  orders: number
  ordersPrevious: number
}

export type Channel = "Web" | "Mobile app" | "Marketplace"

export type ChannelShare = {
  channel: Channel
  revenue: number
}

export type ActivityStatus = "completed" | "pending" | "failed"

export type Activity = {
  id: string
  customer: { name: string; email: string }
  event: string
  channel: Channel
  amount: number
  status: ActivityStatus
  occurredAt: string
}

export type AnalyticsSnapshot = {
  timeframe: Timeframe
  generatedAt: string
  kpis: Kpi[]
  series: SeriesPoint[]
  channels: ChannelShare[]
  activity: Activity[]
  activityTotal: number
}

export type LoadStatus = "loading" | "ready" | "error"

export type SimulatedOutcome = "empty" | "error"
