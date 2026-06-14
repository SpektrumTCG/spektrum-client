import { InventoryFeature } from "@/features/inventory"

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>
}) {
  const { new: highlightPackId } = await searchParams
  return <InventoryFeature highlightPackId={highlightPackId} />
}
