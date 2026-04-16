import { redirect } from "next/navigation"

// Root redirects to /home — replace with actual start page later
export default function RootPage() {
  redirect("/home")
}
