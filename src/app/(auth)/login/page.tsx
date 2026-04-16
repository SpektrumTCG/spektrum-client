import { Shell } from "@/components/layout/Shell"

export default function LoginPage() {
  return (
    <Shell withNav={false}>
      <h1 className="text-xl font-bold mb-4">Sign In</h1>
      <p className="text-sm text-muted-foreground">Auth form goes here</p>
    </Shell>
  )
}
