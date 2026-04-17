"use client"

interface SafeCardImageProps {
  src?: string | null
  alt: string
  className?: string
  style?: React.CSSProperties
  onError?: () => void
}

export function SafeCardImage({ src, alt, className, style, onError }: SafeCardImageProps) {
  const fallbackSrc = "/attached_assets/card-placeholder.png"

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    if (img.src !== window.location.origin + fallbackSrc) {
      img.src = fallbackSrc
    }
    onError?.()
  }

  if (!src) {
    return (
      <div
        className={className}
        style={{ ...style, backgroundColor: "#1f2937", display: "flex", alignItems: "center", justifyContent: "center" }}
        aria-label={alt}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5">
          <rect x="2" y="2" width="20" height="20" rx="2"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
    />
  )
}
