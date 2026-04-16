import { Shell } from "@/components/layout/Shell"
import { DeckBuilderFeature } from "@/features/deck-builder"

export default function DeckBuilderPage() {
  return (
    <Shell>
      <h1 className="text-xl font-bold mb-4">Deck Builder</h1>
      <DeckBuilderFeature />
    </Shell>
  )
}
