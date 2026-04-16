import type { FieldCard, FieldTrigger, FieldTriggerType, AvatarCard, ElementType } from '../types';

/**
 * Evaluates if a field trigger should activate based on conditions
 * @param trigger - The field trigger configuration
 * @param eventContext - Context about the event (element, tribe, etc.)
 * @returns true if trigger conditions are met
 */
export function shouldTriggerActivate(
  trigger: FieldTrigger,
  eventContext: {
    element?: ElementType;
    tribe?: string;
  }
): boolean {
  // If no condition specified, always activate
  if (!trigger.condition) {
    return true;
  }

  // Check if event matches the trigger's element or tribe condition
  if (eventContext.element && trigger.condition === eventContext.element) {
    return true;
  }

  if (eventContext.tribe && trigger.condition === eventContext.tribe) {
    return true;
  }

  return false;
}

/**
 * Processes field triggers for a specific event type
 * @param fieldCards - Active field cards in play
 * @param triggerType - The type of trigger to check (on_draw, on_skill_use)
 * @param eventContext - Context about the event
 * @returns Array of trigger effects to execute
 */
export function processFieldTriggers(
  fieldCards: FieldCard[],
  triggerType: FieldTriggerType,
  eventContext: {
    element?: ElementType;
    tribe?: string;
  }
): Array<{
  effectType: 'damage' | 'heal' | 'draw_card';
  effectValue: number;
}> {
  const effectsToApply: Array<{
    effectType: 'damage' | 'heal' | 'draw_card';
    effectValue: number;
  }> = [];

  // Check each field card for matching triggers
  for (const fieldCard of fieldCards) {
    if (!fieldCard.trigger) continue;

    const trigger = fieldCard.trigger;

    // Check if trigger type matches the event
    if (trigger.triggerType === triggerType) {
      // Check if conditions are met
      if (shouldTriggerActivate(trigger, eventContext)) {
        effectsToApply.push({
          effectType: trigger.effectType,
          effectValue: trigger.effectValue
        });
      }
    }
  }

  return effectsToApply;
}

/**
 * Gets the element and tribe from an avatar for trigger context
 */
export function getAvatarTriggerContext(avatar: AvatarCard | null | undefined): {
  element?: ElementType;
  tribe?: string;
} {
  if (!avatar) return {};

  return {
    element: avatar.element,
    tribe: avatar.subType || avatar.tribe
  };
}
