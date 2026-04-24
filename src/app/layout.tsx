import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Spektrum",
  description: "Spektrum Trading Card Game",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh" }} className="relative">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  )
}
