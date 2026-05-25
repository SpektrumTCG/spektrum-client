import type { Metadata } from "next"
import { Inter, Zen_Dots, Noto_Sans, JetBrains_Mono } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${zenDots.variable} ${notoSans.variable} ${jetbrains.variable}`}
    >
      <body className={inter.className}>
        <ClerkProvider>
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  )
}
