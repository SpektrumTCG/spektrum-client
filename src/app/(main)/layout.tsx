import Image from "next/image"
import { NavigationBar, HamburgerMenu } from "@/components/layout/NavigationBar"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full relative bg-white overflow-hidden">
      {/* Header bar */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full z-20 pointer-events-none"
        style={{ maxWidth: 480 }}
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

      <div className="relative w-full z-10">
        <main>{children}</main>
      </div>
      <HamburgerMenu />
      <NavigationBar />
    </div>
  )
}
