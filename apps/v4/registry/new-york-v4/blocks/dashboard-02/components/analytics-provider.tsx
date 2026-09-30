"use client"

import * as React from "react"

import { fetchAnalytics } from "@/registry/new-york-v4/blocks/dashboard-02/lib/data"
import type {
  AnalyticsSnapshot,
  LoadStatus,
  SimulatedOutcome,
  Timeframe,
} from "@/registry/new-york-v4/blocks/dashboard-02/lib/types"

type AnalyticsState = {
  status: LoadStatus
  data: AnalyticsSnapshot | null
  error: Error | null
}

type AnalyticsContextValue = AnalyticsState & {
  timeframe: Timeframe
  setTimeframe: (timeframe: Timeframe) => void
  refresh: () => void
}

const AnalyticsContext = React.createContext<AnalyticsContextValue | null>(null)

export function AnalyticsProvider({
  children,
  defaultTimeframe = "30d",
  simulate,
}: {
  children: React.ReactNode
  defaultTimeframe?: Timeframe
  /** Force the empty or error outcome, for previews and tests. */
  simulate?: SimulatedOutcome
}) {
  const [timeframe, setTimeframe] = React.useState<Timeframe>(defaultTimeframe)
  const [requestId, setRequestId] = React.useState(0)
  const [state, setState] = React.useState<AnalyticsState>({
    status: "loading",
    data: null,
    error: null,
  })

  React.useEffect(() => {
    const controller = new AbortController()

    setState((previous) => ({ ...previous, status: "loading", error: null }))
    fetchAnalytics(timeframe, { signal: controller.signal, simulate })
      .then((data) => setState({ status: "ready", data, error: null }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState((previous) => ({
          status: "error",
          data: previous.data,
          error: error instanceof Error ? error : new Error(String(error)),
        }))
      })

    return () => controller.abort()
  }, [timeframe, requestId, simulate])

  const refresh = React.useCallback(() => setRequestId((id) => id + 1), [])

  const value = React.useMemo(
    () => ({ ...state, timeframe, setTimeframe, refresh }),
    [state, timeframe, refresh]
  )

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  const context = React.useContext(AnalyticsContext)

  if (!context) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider.")
  }

  return context
}
