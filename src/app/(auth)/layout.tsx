import { AppBootstrap } from "@/components/shared/AppBootstrap"
import { AuthGateModal } from "@/components/shared/AuthGateModal"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh" }} className="relative">
      <AppBootstrap />
      <div className="min-h-dvh w-full flex items-center justify-center">
        <div className="relative w-full max-w-sm">
          {children}
        </div>
      </div>
      <AuthGateModal />
    </div>
  )
}
