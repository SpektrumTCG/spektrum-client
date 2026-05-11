import { headers } from "next/headers"
import { redirect } from "next/navigation"
import LandingPage from "@/components/landing/landing-page"

export default async function RootPage() {
  const ua = (await headers()).get("user-agent") ?? ""
  if (/Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(ua)) {
    redirect("/start")
  }
  return <LandingPage />
}
