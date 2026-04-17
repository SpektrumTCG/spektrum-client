import { NavigationBar } from "@/components/layout/NavigationBar"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full">
      <div className="relative mx-auto w-full max-w-sm">
        <main>{children}</main>
      </div>
      <NavigationBar />
    </div>
  )
}
