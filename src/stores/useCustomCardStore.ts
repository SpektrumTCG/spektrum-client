import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Card } from "@spektrum/shared"

export interface CustomCardModification {
  originalId: string
  modifiedCard: Card
  modifiedAt: number
}

interface CustomCardStore {
  customModifications: CustomCardModification[]
  serverModifications: CustomCardModification[]
  deletedCardIds: string[]

  saveCardModification: (originalId: string, modifiedCard: Card) => void
  getModifiedCard: (originalId: string) => Card | null
  hasModification: (originalId: string) => boolean
  removeModification: (originalId: string) => void
  getAllModifications: () => CustomCardModification[]

  loadServerModifications: (serverMods: CustomCardModification[], serverDeletedIds: string[]) => void

  markCardAsDeleted: (cardId: string) => void
  unmarkCardAsDeleted: (cardId: string) => void
  isCardDeleted: (cardId: string) => boolean
  getAllDeletedIds: () => string[]

  applyModificationsToCards: (cards: Card[]) => Card[]

  migrateFieldNames: () => number
}

export const useCustomCardStore = create<CustomCardStore>()(
  persist(
    (set, get) => ({
      customModifications: [],
      serverModifications: [],
      deletedCardIds: [],

      saveCardModification: (originalId: string, modifiedCard: Card) => {
        set(state => {
          const filteredModifications = state.customModifications.filter(
            mod => mod.originalId !== originalId
          )
          const newModification: CustomCardModification = {
            originalId,
            modifiedCard: { ...modifiedCard },
            modifiedAt: Date.now(),
          }
          return {
            customModifications: [...filteredModifications, newModification],
          }
        })
      },

      getModifiedCard: (originalId: string) => {
        const modification = get().customModifications.find(
          mod => mod.originalId === originalId
        )
        return modification ? modification.modifiedCard : null
      },

      hasModification: (originalId: string) => {
        return get().customModifications.some(mod => mod.originalId === originalId)
      },

      removeModification: (originalId: string) => {
        set(state => ({
          customModifications: state.customModifications.filter(
            mod => mod.originalId !== originalId
          ),
        }))
      },

      getAllModifications: () => {
        return get().customModifications
      },

      loadServerModifications: (serverMods: CustomCardModification[], serverDeletedIds: string[]) => {
        set({
          serverModifications: serverMods,
          deletedCardIds: Array.from(new Set([...serverDeletedIds, ...get().deletedCardIds])),
        })
      },

      markCardAsDeleted: (cardId: string) => {
        set(state => {
          if (!state.deletedCardIds.includes(cardId)) {
            return { deletedCardIds: [...state.deletedCardIds, cardId] }
          }
          return state
        })
      },

      unmarkCardAsDeleted: (cardId: string) => {
        set(state => ({
          deletedCardIds: state.deletedCardIds.filter(id => id !== cardId),
        }))
      },

      isCardDeleted: (cardId: string) => {
        return get().deletedCardIds.includes(cardId)
      },

      getAllDeletedIds: () => {
        return get().deletedCardIds
      },

      applyModificationsToCards: (cards: Card[]) => {
        const { customModifications, serverModifications, deletedCardIds } = get()

        let filteredCards = cards.filter(card => !deletedCardIds.includes(card.id))

        const totalMods = customModifications.length + serverModifications.length
        if (totalMods === 0) {
          return filteredCards
        }

        return filteredCards.map(card => {
          const localMod = customModifications.find(mod => mod.originalId === card.id)
          if (localMod) {
            return { ...localMod.modifiedCard }
          }

          const serverMod = serverModifications.find(mod => mod.originalId === card.id)
          if (serverMod) {
            return { ...serverMod.modifiedCard }
          }

          return card
        })
      },

      migrateFieldNames: () => {
        const { customModifications } = get()
        let migrated = 0

        const migrateSkill = (skill: Record<string, unknown>) => {
          if (!skill) return skill

          let needsMigration = false
          const migratedSkill = { ...skill }

          if ("effectCondition" in skill) {
            migratedSkill.condition = skill.effectCondition
            delete migratedSkill.effectCondition
            needsMigration = true
          }

          if ("effectConditionValue" in skill) {
            migratedSkill.conditionValue = skill.effectConditionValue
            delete migratedSkill.effectConditionValue
            needsMigration = true
          }

          return needsMigration ? migratedSkill : skill
        }

        const migratedModifications = customModifications.map(mod => {
          const card = mod.modifiedCard as unknown as Record<string, unknown>
          let cardNeedsMigration = false
          const migratedCard = { ...card }

          if (card.skill1) {
            const migratedSkill1 = migrateSkill(card.skill1 as Record<string, unknown>)
            if (migratedSkill1 !== card.skill1) {
              migratedCard.skill1 = migratedSkill1
              cardNeedsMigration = true
            }
          }

          if (card.skill2) {
            const migratedSkill2 = migrateSkill(card.skill2 as Record<string, unknown>)
            if (migratedSkill2 !== card.skill2) {
              migratedCard.skill2 = migratedSkill2
              cardNeedsMigration = true
            }
          }

          if (card.skills && Array.isArray(card.skills)) {
            const migratedSkills = (card.skills as Record<string, unknown>[]).map(migrateSkill)
            if (JSON.stringify(migratedSkills) !== JSON.stringify(card.skills)) {
              migratedCard.skills = migratedSkills
              cardNeedsMigration = true
            }
          }

          if (card.skill) {
            const migratedSkill = migrateSkill(card.skill as Record<string, unknown>)
            if (migratedSkill !== card.skill) {
              migratedCard.skill = migratedSkill
              cardNeedsMigration = true
            }
          }

          if (cardNeedsMigration) {
            migrated++
          }

          return cardNeedsMigration
            ? { ...mod, modifiedCard: migratedCard as unknown as Card }
            : mod
        })

        if (migrated > 0) {
          set({ customModifications: migratedModifications })
        }

        return migrated
      },
    }),
    {
      name: "custom-card-modifications",
      partialize: state => ({
        customModifications: state.customModifications,
        deletedCardIds: state.deletedCardIds,
      }),
    }
  )
)
