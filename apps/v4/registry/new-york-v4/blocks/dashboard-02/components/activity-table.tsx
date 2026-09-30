"use client"

import * as React from "react"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  InboxIcon,
  SearchXIcon,
} from "lucide-react"

import { useAnalytics } from "@/registry/new-york-v4/blocks/dashboard-02/components/analytics-provider"
import {
  SectionEmpty,
  SectionError,
} from "@/registry/new-york-v4/blocks/dashboard-02/components/section-state"
import {
  formatCurrency,
  formatNumber,
  formatRelativeTime,
  getInitials,
} from "@/registry/new-york-v4/blocks/dashboard-02/lib/format"
import type {
  Activity,
  ActivityStatus,
} from "@/registry/new-york-v4/blocks/dashboard-02/lib/types"
import { Avatar, AvatarFallback } from "@/registry/new-york-v4/ui/avatar"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/new-york-v4/ui/select"
import { Skeleton } from "@/registry/new-york-v4/ui/skeleton"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/new-york-v4/ui/table"

const PAGE_SIZE = 5

type StatusFilter = ActivityStatus | "all"
type SortOrder = "none" | "descending" | "ascending"

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
]

const STATUS_BADGES: Record<
  ActivityStatus,
  { label: string; variant: "secondary" | "outline" | "destructive" }
> = {
  completed: { label: "Completed", variant: "secondary" },
  pending: { label: "Pending", variant: "outline" },
  failed: { label: "Failed", variant: "destructive" },
}

const NEXT_SORT: Record<SortOrder, SortOrder> = {
  none: "descending",
  descending: "ascending",
  ascending: "none",
}

function formatAmount(amount: number) {
  const value = formatCurrency(Math.abs(amount), { precise: true })
  return amount < 0 ? `−${value}` : value
}

function StatusBadge({ status }: { status: ActivityStatus }) {
  const { label, variant } = STATUS_BADGES[status]
  return <Badge variant={variant}>{label}</Badge>
}

function CustomerCell({ item }: { item: Activity }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar>
        <AvatarFallback className="text-xs">
          {getInitials(item.customer.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{item.customer.name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {item.customer.email}
        </span>
      </div>
    </div>
  )
}

function ActivitySkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4">
      {Array.from({ length: PAGE_SIZE }, (_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3 w-2/5" />
            <Skeleton className="h-2.5 w-1/4" />
          </div>
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  )
}

export function ActivityTable() {
  const { status, data, refresh } = useAnalytics()
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")
  const [sort, setSort] = React.useState<SortOrder>("none")
  const [page, setPage] = React.useState(0)
  const filterId = React.useId()

  const rows = React.useMemo(() => {
    const filtered = (data?.activity ?? []).filter(
      (item) => statusFilter === "all" || item.status === statusFilter
    )
    if (sort === "none") return filtered
    return [...filtered].sort((a, b) =>
      sort === "ascending" ? a.amount - b.amount : b.amount - a.amount
    )
  }, [data, statusFilter, sort])

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount - 1)
  const visibleRows = rows.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  )
  const now = data ? new Date(data.generatedAt).getTime() : Date.now()
  const hasActivity = (data?.activity.length ?? 0) > 0
  const isFilteredEmpty = hasActivity && rows.length === 0

  const SortIcon =
    sort === "ascending"
      ? ArrowUpIcon
      : sort === "descending"
        ? ArrowDownIcon
        : ArrowUpDownIcon

  let content: React.ReactNode
  if (status === "loading") {
    content = <ActivitySkeleton />
  } else if (status === "error") {
    content = <SectionError title="Activity unavailable" onRetry={refresh} />
  } else if (!hasActivity) {
    content = (
      <SectionEmpty
        icon={InboxIcon}
        title="No activity yet"
        description="Events appear here as customers order, pay and subscribe."
      />
    )
  } else if (isFilteredEmpty) {
    content = (
      <SectionEmpty
        icon={SearchXIcon}
        title={`No ${statusFilter} events`}
        description="Nothing matches this filter in the selected timeframe."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            Clear filter
          </Button>
        }
      />
    )
  } else {
    content = (
      <>
        {/* Below the tablet width the table becomes a list: five columns do
            not fit on a phone without horizontal scrolling. */}
        <ul
          aria-label="Recent activity"
          className="flex flex-col @3xl/main:hidden"
        >
          {visibleRows.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 border-b py-3 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <CustomerCell item={item} />
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="font-mono text-sm tabular-nums">
                  {formatAmount(item.amount)}
                </span>
                <StatusBadge status={item.status} />
              </div>
            </li>
          ))}
        </ul>
        <Table className="hidden @3xl/main:table">
          <TableCaption className="sr-only">
            Recent activity, {rows.length} events
            {statusFilter !== "all" && `, filtered to ${statusFilter}`}.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Event</TableHead>
              <TableHead className="hidden @5xl/main:table-cell">
                Channel
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead aria-sort={sort} className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-mr-3"
                  onClick={() => setSort(NEXT_SORT[sort])}
                >
                  Amount
                  <SortIcon aria-hidden="true" />
                  <span className="sr-only">
                    {sort === "none" ? ", not sorted" : `, sorted ${sort}`}
                  </span>
                </Button>
              </TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="max-w-64">
                  <CustomerCell item={item} />
                </TableCell>
                <TableCell>{item.event}</TableCell>
                <TableCell className="hidden text-muted-foreground @5xl/main:table-cell">
                  {item.channel}
                </TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatAmount(item.amount)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  <time dateTime={item.occurredAt}>
                    {formatRelativeTime(item.occurredAt, now)}
                  </time>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Recent activity</h2>
        </CardTitle>
        <CardDescription>
          Latest payments and account events across all channels.
        </CardDescription>
        <CardAction>
          <label htmlFor={filterId} className="sr-only">
            Filter by status
          </label>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as StatusFilter)
              setPage(0)
            }}
            disabled={status !== "ready" || !hasActivity}
          >
            <SelectTrigger id={filterId} size="sm" className="w-36">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent align="end">
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent aria-busy={status === "loading"}>{content}</CardContent>
      {status === "ready" && rows.length > 0 && (
        <CardFooter className="flex-wrap justify-between gap-2">
          <p className="text-xs text-muted-foreground tabular-nums">
            Showing {visibleRows.length} of{" "}
            {formatNumber(
              statusFilter === "all"
                ? (data?.activityTotal ?? rows.length)
                : rows.length
            )}{" "}
            events
          </p>
          <nav aria-label="Activity pages" className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= pageCount - 1}
            >
              Next
            </Button>
          </nav>
        </CardFooter>
      )}
    </Card>
  )
}
