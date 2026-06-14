import type { Metadata, Viewport } from "next"
import { Inter, Zen_Dots, Noto_Sans, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const zenDots = Zen_Dots({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
})

const notoSans = Noto_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
})

export const metadata: Metadata = {
  title: "Spektrum",
  description: "Spektrum Trading Card Game",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Unlocks env(safe-area-inset-*) on notch/home-bar phones; without it those
  // values resolve to 0 and the body safe-area padding is dead code.
  viewportFit: "cover",
  themeColor: "#ffffff",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      // UI-scale store sets documentElement font-size on the client (theming);
      // SSR can't know the persisted value, so allow this attribute to differ.
      suppressHydrationWarning
      className={`${inter.variable} ${zenDots.variable} ${notoSans.variable} ${jetbrains.variable}`}
    >
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
