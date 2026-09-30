import type {
  Activity,
  AnalyticsSnapshot,
  ChannelShare,
  Kpi,
  SeriesPoint,
  SimulatedOutcome,
  Timeframe,
} from "@/registry/new-york-v4/blocks/dashboard-02/lib/types"

// Sample data only. Replace fetchAnalytics with a call to your API; every
// component reads the AnalyticsSnapshot shape and nothing else.

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
const AVERAGE_ORDER_VALUE = 214

const TIMEFRAME_CONFIG: Record<
  Timeframe,
  {
    points: number
    step: number
    revenuePerPoint: number
    activeUsers: [number, number]
    conversionRate: [number, number]
    churnRate: [number, number]
    activityTotal: number
    seed: number
  }
> = {
  "24h": {
    points: 24,
    step: HOUR,
    revenuePerPoint: 2008,
    activeUsers: [8412, 8239],
    conversionRate: [0.0342, 0.0339],
    churnRate: [0.0021, 0.0025],
    activityTotal: 128,
    seed: 24,
  },
  "7d": {
    points: 7,
    step: DAY,
    revenuePerPoint: 44706,
    activeUsers: [41207, 42657],
    conversionRate: [0.0318, 0.032],
    churnRate: [0.0146, 0.0134],
    activityTotal: 904,
    seed: 7,
  },
  "30d": {
    points: 30,
    step: DAY,
    revenuePerPoint: 42667,
    activeUsers: [126880, 118801],
    conversionRate: [0.0327, 0.0323],
    churnRate: [0.029, 0.032],
    activityTotal: 3812,
    seed: 30,
  },
}

const CHANNEL_SHARES: [ChannelShare["channel"], number][] = [
  ["Web", 0.46],
  ["Mobile app", 0.38],
  ["Marketplace", 0.16],
]

const RECENT_ACTIVITY: (Omit<Activity, "occurredAt" | "id"> & {
  minutesAgo: number
})[] = [
  {
    customer: { name: "Noura Al-Qahtani", email: "noura@example.com" },
    event: "Subscription renewed",
    channel: "Web",
    amount: 1240,
    status: "completed",
    minutesAgo: 2,
  },
  {
    customer: { name: "Faisal Al-Harbi", email: "faisal@example.com" },
    event: "New order",
    channel: "Mobile app",
    amount: 389.5,
    status: "pending",
    minutesAgo: 8,
  },
  {
    customer: { name: "Lina Haddad", email: "lina@example.com" },
    event: "Refund issued",
    channel: "Web",
    amount: -120,
    status: "completed",
    minutesAgo: 14,
  },
  {
    customer: { name: "Omar Siddiqui", email: "omar@example.com" },
    event: "Payment failed",
    channel: "Mobile app",
    amount: 2050,
    status: "failed",
    minutesAgo: 21,
  },
  {
    customer: { name: "Sara Al-Otaibi", email: "sara@example.com" },
    event: "New order",
    channel: "Marketplace",
    amount: 760.25,
    status: "completed",
    minutesAgo: 35,
  },
  {
    customer: { name: "Yousef Al-Mutairi", email: "yousef@example.com" },
    event: "Plan upgraded",
    channel: "Web",
    amount: 4800,
    status: "completed",
    minutesAgo: 62,
  },
  {
    customer: { name: "Reem Al-Shehri", email: "reem@example.com" },
    event: "New order",
    channel: "Marketplace",
    amount: 215,
    status: "pending",
    minutesAgo: 75,
  },
]

// Deterministic PRNG so a timeframe always renders the same sample series.
function createRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function formatPointLabel(timeframe: Timeframe, date: Date) {
  if (timeframe === "24h") {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(timeframe === "7d" && { weekday: "short" }),
  })
}

function createSeries(timeframe: Timeframe, now: number): SeriesPoint[] {
  const config = TIMEFRAME_CONFIG[timeframe]
  const random = createRandom(config.seed)

  return Array.from({ length: config.points }, (_, index) => {
    const progress = index / (config.points - 1)
    const noise = (random() - 0.5) * 0.06
    const revenue =
      config.revenuePerPoint *
      (1 +
        0.16 * Math.sin(index * 0.9 + 1) +
        0.07 * Math.sin(index * 2.3) +
        0.12 * progress +
        noise)
    const revenuePrevious = revenue * (0.86 + 0.05 * Math.sin(index * 1.7))
    const date = new Date(now - (config.points - 1 - index) * config.step)

    return {
      label: formatPointLabel(timeframe, date),
      revenue: Math.round(revenue),
      revenuePrevious: Math.round(revenuePrevious),
      orders: Math.round(revenue / AVERAGE_ORDER_VALUE),
      ordersPrevious: Math.round(revenuePrevious / AVERAGE_ORDER_VALUE),
    }
  })
}

function createSparkline(seed: number, drift: number) {
  const random = createRandom(seed)
  return Array.from(
    { length: 16 },
    (_, index) =>
      50 +
      14 * Math.sin(index * 0.8 + seed) +
      6 * Math.sin(index * 2.1 + seed * 2) +
      drift * index +
      (random() - 0.5) * 4
  )
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0)
}

export function createSnapshot(
  timeframe: Timeframe,
  now = Date.now()
): AnalyticsSnapshot {
  const config = TIMEFRAME_CONFIG[timeframe]
  const series = createSeries(timeframe, now)
  const revenue = sum(series.map((point) => point.revenue))
  const revenuePrevious = sum(series.map((point) => point.revenuePrevious))

  const kpis: Kpi[] = [
    {
      id: "revenue",
      label: "Revenue",
      description: "Gross revenue after refunds, in Saudi riyals.",
      format: "currency",
      value: revenue,
      previous: revenuePrevious,
      higherIsBetter: true,
      sparkline: series.map((point) => point.revenue),
    },
    {
      id: "active-users",
      label: "Active users",
      description: "Unique signed-in users with at least one session.",
      format: "number",
      value: config.activeUsers[0],
      previous: config.activeUsers[1],
      higherIsBetter: true,
      sparkline: createSparkline(config.seed + 1, 0.6),
    },
    {
      id: "conversion-rate",
      label: "Conversion rate",
      description: "Orders divided by sessions.",
      format: "percent",
      value: config.conversionRate[0],
      previous: config.conversionRate[1],
      higherIsBetter: true,
      sparkline: createSparkline(config.seed + 2, 0.2),
    },
    {
      id: "churn-rate",
      label: "Churn rate",
      description: "Share of subscribers who cancelled. Lower is better.",
      format: "percent",
      value: config.churnRate[0],
      previous: config.churnRate[1],
      higherIsBetter: false,
      sparkline: createSparkline(config.seed + 3, -0.4),
    },
  ]

  return {
    timeframe,
    generatedAt: new Date(now).toISOString(),
    kpis,
    series,
    channels: CHANNEL_SHARES.map(([channel, share]) => ({
      channel,
      revenue: Math.round(revenue * share),
    })),
    activity: RECENT_ACTIVITY.map(({ minutesAgo, ...item }, index) => ({
      ...item,
      id: `evt_${timeframe}_${index + 1}`,
      occurredAt: new Date(now - minutesAgo * 60 * 1000).toISOString(),
    })),
    activityTotal: config.activityTotal,
  }
}

export function createEmptySnapshot(
  timeframe: Timeframe,
  now = Date.now()
): AnalyticsSnapshot {
  const snapshot = createSnapshot(timeframe, now)

  return {
    ...snapshot,
    kpis: snapshot.kpis.map((kpi) => ({
      ...kpi,
      value: 0,
      previous: 0,
      sparkline: [],
    })),
    series: [],
    channels: snapshot.channels.map((channel) => ({ ...channel, revenue: 0 })),
    activity: [],
    activityTotal: 0,
  }
}

export function fetchAnalytics(
  timeframe: Timeframe,
  {
    signal,
    simulate,
    latency = 650,
  }: {
    signal?: AbortSignal
    simulate?: SimulatedOutcome
    latency?: number
  } = {}
): Promise<AnalyticsSnapshot> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (simulate === "error") {
        reject(new Error("The metrics service did not respond."))
        return
      }

      resolve(
        simulate === "empty"
          ? createEmptySnapshot(timeframe)
          : createSnapshot(timeframe)
      )
    }, latency)

    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer)
        reject(new DOMException("The request was aborted.", "AbortError"))
      },
      { once: true }
    )
  })
}
