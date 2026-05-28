import { useDeckStore } from '@/stores/useDeckStore';
import { useAchievementsStore } from '@/stores/useAchievementsStore';
import type { Card, ElementType, AvatarCard } from '@spektrum/shared';

export interface CollectionBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  isComplete: boolean;
  progress: number;
  total: number;
}

export const useCollectionBadges = () => {
  const { getAvailableCards } = useDeckStore();
  const { getProgress, unlockAchievement, setProgress } = useAchievementsStore();

  const getAllCards = (): Card[] => {
    return getAvailableCards();
  };

  const getOwnedCards = (): Card[] => {
    return [];
  };

  const getCardsByElement = (element: ElementType): Card[] => {
    return getAllCards().filter((c: Card) => c.element === element);
  };

  const getOwnedCardsByElement = (element: ElementType): Set<string> => {
    return new Set(
      getOwnedCards()
        .filter((c: Card) => c.element === element)
        .map((c: Card) => c.id)
    );
  };

  const getUniqueTribes = (): Set<string> => {
    const tribes = new Set<string>();
    getAllCards().forEach((c: Card) => {
      if (c.type === 'avatar' && 'subType' in c) {
        tribes.add((c as AvatarCard).subType);
      }
    });
    return tribes;
  };

  const getOwnedTribes = (): Set<string> => {
    const tribes = new Set<string>();
    getOwnedCards().forEach((c: Card) => {
      if (c.type === 'avatar' && 'subType' in c) {
        tribes.add((c as AvatarCard).subType);
      }
    });
    return tribes;
  };

  const getCollectionBadges = (): CollectionBadge[] => {
    const badges: CollectionBadge[] = [];
    const ownedCards = getOwnedCards();
    const ownedCardIds = new Set(ownedCards.map((c: Card) => c.id));
    const uniqueCardCount = new Set(
      getAllCards()
        .filter((c: Card) => ownedCardIds.has(c.id))
        .map((c: Card) => c.id)
    ).size;

    const elements: ElementType[] = ['fire', 'water', 'ground', 'air', 'neutral'];
    const elementIcons: Record<ElementType, string> = {
      fire: 'svg-fire',
      water: 'svg-water',
      ground: 'svg-ground',
      air: 'svg-air',
      neutral: 'svg-neutral'
    };

    elements.forEach(element => {
      const allCards = getCardsByElement(element);
      const ownedEl = getOwnedCardsByElement(element);
      const isComplete = allCards.length > 0 && allCards.every(c => ownedEl.has(c.id));

      if (isComplete && !getProgress(`collect_${element}_complete`)?.isUnlocked) {
        unlockAchievement(`collect_${element}_complete`);
      }

      badges.push({
        id: `element_${element}`,
        name: `${element.charAt(0).toUpperCase() + element.slice(1)} Collection`,
        description: `${ownedEl.size} / ${allCards.length} cards`,
        icon: elementIcons[element],
        isComplete,
        progress: Math.min(ownedEl.size, allCards.length),
        total: allCards.length
      });
    });

    const ownedTribes = getOwnedTribes();
    const uniqueTribes = getUniqueTribes();
    const allTribesOwned = uniqueTribes.size > 0 && ownedTribes.size === uniqueTribes.size;

    if (allTribesOwned && !getProgress('collect_all_tribes')?.isUnlocked) {
      unlockAchievement('collect_all_tribes');
    }

    badges.push({
      id: 'all_tribes',
      name: 'Tribal Herald',
      description: `${ownedTribes.size} / ${uniqueTribes.size} tribes`,
      icon: '',
      isComplete: allTribesOwned,
      progress: ownedTribes.size,
      total: uniqueTribes.size
    });

    const hasMythic = ownedCards.some((c: Card) => c.rarity === 'Mythic');
    if (hasMythic && !getProgress('collect_mythic')?.isUnlocked) {
      unlockAchievement('collect_mythic');
    }

    if (uniqueCardCount >= 50 && !getProgress('collect_50_unique')?.isUnlocked) {
      setProgress('collect_50_unique', 50);
      unlockAchievement('collect_50_unique');
    }

    if (uniqueCardCount >= 100 && !getProgress('collect_100_unique')?.isUnlocked) {
      setProgress('collect_100_unique', 100);
      unlockAchievement('collect_100_unique');
    }

    badges.push({
      id: 'unique_count',
      name: 'Collection Growth',
      description: `${uniqueCardCount} unique cards`,
      icon: '',
      isComplete: uniqueCardCount >= 100,
      progress: uniqueCardCount,
      total: 100
    });

    return badges;
  };

  return { getCollectionBadges };
};
