// src/components/modals/BaseModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface BaseModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function BaseModal({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: BaseModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className={cn("max-w-sm rounded-2xl p-4", className)}>
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle className="text-base font-semibold">{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  )
}
