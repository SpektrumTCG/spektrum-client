import { Shell } from "@/components/layout/Shell"
import { ShopFeature } from "@/features/shop"

export default function ShopPage() {
  return (
    <Shell>
      <h1 className="text-xl font-bold mb-4">Shop</h1>
      <ShopFeature />
    </Shell>
  )
}
