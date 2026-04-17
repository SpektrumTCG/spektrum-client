// Augment ImportMeta to support legacy Vite-style import.meta.env usage
// in blockchain feature files that were ported from a Vite project.
interface ImportMeta {
  readonly env: Record<string, string | undefined>
}
