import { Shell } from "@/components/layout/Shell"
import { InventoryFeature } from "@/features/inventory"

export default function InventoryPage() {
  return (
    <Shell>
      <h1 className="text-xl font-bold mb-4">Inventory</h1>
      <InventoryFeature />
    </Shell>
  )
}
