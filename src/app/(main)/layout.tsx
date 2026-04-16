// src/app/(main)/layout.tsx
import { NavigationBar } from "@/components/layout/NavigationBar"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="min-h-dvh">{children}</main>
      <NavigationBar />
    </>
  )
}
