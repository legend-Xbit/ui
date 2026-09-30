import { cn } from "cn"
import { CircleAlertIcon, type LucideIcon } from "lucide-react"

import { Button } from "@/registry/new-york-v4/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/new-york-v4/ui/empty"

export function SectionEmpty({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <Empty className={cn("border border-dashed", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  )
}

export function SectionError({
  title,
  onRetry,
  className,
}: {
  title: string
  onRetry: () => void
  className?: string
}) {
  return (
    <SectionEmpty
      icon={CircleAlertIcon}
      title={title}
      description="We couldn’t reach the metrics service. Your data is safe."
      className={cn("border-destructive/40", className)}
      action={
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      }
    />
  )
}
