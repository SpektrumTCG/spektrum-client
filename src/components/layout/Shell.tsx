// src/components/layout/Shell.tsx
import { cn } from "@/lib/utils"
import { NAV_HEIGHT } from "@/lib/constants"

interface ShellProps {
  children: React.ReactNode
  className?: string
  maxWidth?: "max-w-sm" | "max-w-md" | "max-w-lg"
  withNav?: boolean
}

export function Shell({
  children,
  className,
  maxWidth = "max-w-sm",
  withNav = true,
}: ShellProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4", maxWidth, className)}
      style={{ paddingBottom: withNav ? NAV_HEIGHT + 16 : undefined }}
    >
      {children}
    </div>
  )
}
