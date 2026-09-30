import type {
  Activity,
  Kpi,
  KpiFormat,
  Timeframe,
} from "@/registry/new-york-v4/blocks/dashboard-02/lib/types"

const LOCALE = "en-US"

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "SAR",
  currencyDisplay: "code",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const preciseCurrencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "SAR",
  currencyDisplay: "code",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const compactFormatter = new Intl.NumberFormat(LOCALE, {
  notation: "compact",
  maximumFractionDigits: 1,
})

const numberFormatter = new Intl.NumberFormat(LOCALE)

const percentFormatter = new Intl.NumberFormat(LOCALE, {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const relativeTimeFormatter = new Intl.RelativeTimeFormat(LOCALE, {
  numeric: "auto",
  style: "short",
})

export const TIMEFRAME_LABELS: Record<
  Timeframe,
  { short: string; long: string; previous: string }
> = {
  "24h": {
    short: "24h",
    long: "Last 24 hours",
    previous: "previous 24 hours",
  },
  "7d": { short: "7d", long: "Last 7 days", previous: "previous 7 days" },
  "30d": { short: "30d", long: "Last 30 days", previous: "previous 30 days" },
}

export function formatCurrency(value: number, { precise = false } = {}) {
  return (precise ? preciseCurrencyFormatter : currencyFormatter).format(value)
}

export function formatCompact(value: number) {
  return compactFormatter.format(value)
}

export function formatNumber(value: number) {
  return numberFormatter.format(value)
}

export function formatKpiValue(value: number, format: KpiFormat) {
  if (format === "currency") {
    return value >= 1_000_000
      ? `SAR ${compactFormatter.format(value)}`
      : formatCurrency(value)
  }

  if (format === "percent") {
    return percentFormatter.format(value)
  }

  return formatNumber(value)
}

export type KpiDelta = {
  label: string
  direction: "up" | "down" | "flat"
  sentiment: "positive" | "negative" | "neutral"
  description: string
}

// Rates change in percentage points, totals in percent. The sentiment follows
// higherIsBetter, so a falling churn rate reads as an improvement.
export function getKpiDelta(kpi: Kpi): KpiDelta {
  const change =
    kpi.format === "percent"
      ? (kpi.value - kpi.previous) * 100
      : kpi.previous === 0
        ? 0
        : ((kpi.value - kpi.previous) / kpi.previous) * 100
  const rounded = Math.round(change * 100) / 100
  const direction = rounded > 0 ? "up" : rounded < 0 ? "down" : "flat"
  const sign = rounded > 0 ? "+" : rounded < 0 ? "−" : ""
  const magnitude = Math.abs(rounded).toFixed(kpi.format === "percent" ? 2 : 1)
  const unit = kpi.format === "percent" ? " pt" : "%"
  const sentiment =
    direction === "flat"
      ? "neutral"
      : (direction === "up") === kpi.higherIsBetter
        ? "positive"
        : "negative"

  return {
    label: `${sign}${magnitude}${unit}`,
    direction,
    sentiment,
    description:
      sentiment === "neutral"
        ? "unchanged"
        : sentiment === "positive"
          ? "improved"
          : "worsened",
  }
}

export function formatRelativeTime(iso: string, now = Date.now()) {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000)
  const minutes = Math.round(seconds / 60)
  const hours = Math.round(minutes / 60)

  if (Math.abs(seconds) < 60) return relativeTimeFormatter.format(0, "second")
  if (Math.abs(minutes) < 60)
    return relativeTimeFormatter.format(minutes, "minute")
  if (Math.abs(hours) < 24) return relativeTimeFormatter.format(hours, "hour")
  return relativeTimeFormatter.format(Math.round(hours / 24), "day")
}

export function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function escapeCsv(value: string | number) {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toActivityCsv(activity: Activity[]) {
  const header = ["Customer", "Email", "Event", "Channel", "Amount", "Status"]
  const rows = activity.map((item) => [
    item.customer.name,
    item.customer.email,
    item.event,
    item.channel,
    item.amount.toFixed(2),
    item.status,
    item.occurredAt,
  ])

  return [[...header, "Occurred at"], ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n")
}
