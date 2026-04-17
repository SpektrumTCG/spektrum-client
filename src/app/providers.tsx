"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { Toaster } from "@/components/ui/sonner"
import { AppBootstrap } from "@/components/shared/AppBootstrap"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppBootstrap />
      {children}
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  )
}
