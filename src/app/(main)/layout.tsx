import { ViewTransition } from "react"
import Image from "next/image"
import { NavigationBar, HamburgerMenu } from "@/components/layout/NavigationBar"
import { GutterBackdrop } from "@/components/layout/GutterBackdrop"
import { AppBootstrap } from "@/components/shared/AppBootstrap"
import { AuthGateModal } from "@/components/shared/AuthGateModal"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
    <GutterBackdrop />
    <div
      style={{ maxWidth: 480 }}
      className="relative z-10 mx-auto h-[100dvh] overflow-hidden transform-gpu min-[481px]:my-4 min-[481px]:h-[calc(100dvh-2rem)] min-[481px]:rounded-[28px] min-[481px]:shadow-2xl min-[481px]:ring-1 min-[481px]:ring-white/10"
    >
    <AppBootstrap />
    <div className="h-full w-full relative bg-white overflow-hidden flex flex-col">
      {/* Header bar — anchored during transitions */}
      <div
        className="absolute top-0 left-0 w-full z-20 pointer-events-none overflow-hidden min-[481px]:rounded-t-[28px]"
        style={{ viewTransitionName: "site-header" }}
      >
        <Image
          src="/ui/v2-ui/bg-header.png"
          alt=""
          width={480}
          height={48}
          className="w-full h-auto"
          aria-hidden="true"
          priority
        />
      </div>

      {/* Decorative hexagon elements */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <Image
          src="/ui/v2-ui/bg-element.png"
          alt=""
          width={280}
          height={330}
          className="absolute top-12 -right-12 opacity-[0.07]"
          aria-hidden="true"
        />
        <Image
          src="/ui/v2-ui/bg-element.png"
          alt=""
          width={240}
          height={280}
          className="absolute bottom-36 -left-16 opacity-[0.07] rotate-12"
          aria-hidden="true"
        />
      </div>

      <div className="relative w-full z-10 flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <main>
          <ViewTransition name="page-content" enter="page-enter" exit="page-exit" default="page-crossfade">
            {children}
          </ViewTransition>
        </main>
      </div>
      <HamburgerMenu />
      <NavigationBar />
      <AuthGateModal />
    </div>
    </div>
    </>
  )
}
