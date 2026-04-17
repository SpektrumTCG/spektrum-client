export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full flex items-center justify-center">
      <div className="relative w-full max-w-sm">
        {children}
      </div>
    </div>
  )
}
