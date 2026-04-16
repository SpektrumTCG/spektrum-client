import { Shell } from "@/components/layout/Shell"
import { TutorialFeature } from "@/features/tutorial"

export default function TutorialPage() {
  return (
    <Shell>
      <h1 className="text-xl font-bold mb-4">Tutorial</h1>
      <TutorialFeature />
    </Shell>
  )
}
