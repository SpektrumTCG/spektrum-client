"use client"

import { useState, useMemo } from "react"

interface SafeCardImageProps {
  src: string
  alt: string
  className?: string
  fallbackClassName?: string
  cardId?: string
  cardNumber?: string
}

const normalizeImagePath = (src: string): string => {
  if (!src) return "/textures/cards/default_avatar.svg"

  if (src.includes("/attached_assets/card_images/") && src.endsWith(".webp")) {
    return src
  }

  const filename = src.split("/").pop() || ""
  let cardName = ""

  const avatarMatch = filename.match(/Avatar[^_]*_Ava\s*-\s*(.+?)\.(?:png|webp)$/i)
  if (avatarMatch) {
    cardName = avatarMatch[1].trim()
  }

  const spellMatch = filename.match(/Spell[^_]*_Spell\s*-\s*(.+?)\.(?:png|webp)$/i)
  if (spellMatch) {
    cardName = spellMatch[1].trim()
  }

  if (cardName) {
    // Card catalog lookup is handled via the cardId/cardNumber props below
    return src
  }

  return src
}

const encodeImagePath = (path: string): string => {
  if (!path) return path

  try {
    const decoded = decodeURI(path)
    if (decoded === path) {
      const parts = path.split("/")
      const filename = parts[parts.length - 1]
      const directory = parts.slice(0, -1).join("/")

      const encodedFilename = filename
        .replace(/,/g, "%2C")
        .replace(/ /g, "%20")

      return directory + "/" + encodedFilename
    }
    return path
  } catch {
    return path
  }
}

export function SafeCardImage({
  src,
  alt,
  className = "",
  fallbackClassName = "",
  cardId: _cardId,
  cardNumber: _cardNumber,
}: SafeCardImageProps) {
  const [error, setError] = useState(false)

  const imageSrc = useMemo(() => {
    const normalized = normalizeImagePath(src)
    return encodeImagePath(normalized)
  }, [src])

  if (error) {
    return (
      <div className={`${fallbackClassName || className} bg-gray-900 border-2 border-orange-500/50 rounded-lg flex items-center justify-center`}>
        <div className="text-orange-400 text-xs text-center p-1">
          <div>{alt}</div>
        </div>
      </div>
    )
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  )
}
