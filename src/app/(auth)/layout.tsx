import { AppBootstrap } from "@/components/shared/AppBootstrap"
import { AuthGateModal } from "@/components/shared/AuthGateModal"
import { GutterBackdrop } from "@/components/layout/GutterBackdrop"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GutterBackdrop />
      <div
        style={{ maxWidth: 420 }}
        className="relative z-10 mx-auto h-[100dvh] bg-white overflow-hidden transform-gpu min-[421px]:my-4 min-[421px]:h-[calc(100dvh-2rem)] min-[421px]:rounded-[28px] min-[421px]:shadow-2xl min-[421px]:ring-1 min-[421px]:ring-black/5"
      >
        <AppBootstrap />
        <div className="h-full w-full flex items-center justify-center overflow-y-auto">
          <div className="relative w-full max-w-sm">
            {children}
          </div>
        </div>
        <AuthGateModal />
      </div>
    </>
  )
}
