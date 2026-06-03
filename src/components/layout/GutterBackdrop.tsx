/**
 * Desktop gutter backdrop — blurred app art behind the 480px mobile column.
 * Only visible beyond the column (>480px). Hidden on phones to skip the blur cost.
 */
export function GutterBackdrop() {
  return (
    <div
      className="hidden min-[481px]:block fixed inset-0 z-0 pointer-events-none"
      style={{ backgroundColor: "#0d0d1a" }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{
          backgroundImage: "url('/ui/v2-ui/bg-element.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "420px auto",
          filter: "blur(48px) saturate(1.1)",
          transform: "scale(1.4)",
          opacity: 0.35,
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 90% at 50% 50%, rgba(13,13,26,0.2), rgba(13,13,26,0.85))" }}
      />
    </div>
  )
}
