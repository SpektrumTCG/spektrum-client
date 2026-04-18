import type { AvatarCard, ActionCard } from '@/domain/game/types'

type CardLike = { art?: string; imagePath?: string; type?: string } | AvatarCard | ActionCard | any

// Map of broken image paths to corrected ones
const IMAGE_CORRECTIONS: Record<string, string> = {
  // Default fallback images by card type
  DEFAULT_AVATAR: '/cards/default_avatar.svg',
  DEFAULT_SPELL: '/cards/default_avatar.svg',
  DEFAULT_QUICK_SPELL: '/cards/default_avatar.svg',
}

// Migrate old image paths to new structure
function migrateToGenesisPath(path: string): string {
  if (!path) return path

  const migrations: [string, string][] = [
    ['/attached_assets/card_images/GENESIS/', '/cards/GENESIS/'],
    ['/attached_assets/card_images/fire/', '/cards/GENESIS/fire/'],
    ['/attached_assets/card_images/water/', '/cards/GENESIS/water/'],
    ['/attached_assets/card_images/neutral/', '/cards/GENESIS/neutral/'],
  ]

  for (const [oldPattern, newPattern] of migrations) {
    if (path.includes(oldPattern)) {
      return path.replace(oldPattern, newPattern)
    }
  }

  return path
}

// Encode image path for browser (handle spaces, commas and special characters)
function encodeImagePath(path: string): string {
  if (!path) return path
  try {
    const decoded = decodeURI(path)
    if (decoded === path) {
      const parts = path.split('/')
      const filename = parts[parts.length - 1]
      const directory = parts.slice(0, -1).join('/')

      const encodedFilename = filename.replace(/,/g, '%2C').replace(/ /g, '%20')

      return directory + '/' + encodedFilename
    }
    return path
  } catch {
    return path
  }
}

// Get the correct image path or a fallback
export function getFixedCardImagePath(card: CardLike): string {
  let imagePath = card.art || card.imagePath

  if (!imagePath) {
    return '/cards/default_avatar.svg'
  }

  imagePath = migrateToGenesisPath(imagePath)

  if (IMAGE_CORRECTIONS[imagePath]) {
    return encodeImagePath(IMAGE_CORRECTIONS[imagePath])
  }

  return encodeImagePath(imagePath)
}

// Implementation of a card image error handler
export function handleCardImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  card: CardLike
): void {
  const target = event.currentTarget
  const imagePath = card.art || card.imagePath

  if (imagePath && IMAGE_CORRECTIONS[imagePath]) {
    target.src = IMAGE_CORRECTIONS[imagePath]
  } else if (card.type === 'avatar') {
    target.src = IMAGE_CORRECTIONS['DEFAULT_AVATAR'] || '/cards/card_back.png'
  } else if (card.type === 'quickSpell') {
    target.src = IMAGE_CORRECTIONS['DEFAULT_QUICK_SPELL'] || '/cards/card_back.png'
  } else {
    target.src = IMAGE_CORRECTIONS['DEFAULT_SPELL'] || '/cards/card_back.png'
  }

  target.onerror = null
}
