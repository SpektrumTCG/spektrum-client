"use client"

import { create } from "zustand"

export type AuthGateIntent =
  | "play-ai"
  | "play-casual"
  | "play-ranked"
  | "play-ante"
  | "buy-pack"
  | "open-pack"
  | "generic"

interface AuthGateState {
  isOpen: boolean
  intent: AuthGateIntent
  pendingAction: (() => void) | null
  open: (opts: { intent: AuthGateIntent; onSuccess?: () => void }) => void
  close: () => void
  consumePendingAction: () => (() => void) | null
}

export const useAuthGateStore = create<AuthGateState>((set, get) => ({
  isOpen: false,
  intent: "generic",
  pendingAction: null,
  open: ({ intent, onSuccess }) =>
    set({ isOpen: true, intent, pendingAction: onSuccess ?? null }),
  close: () => set({ isOpen: false, pendingAction: null }),
  consumePendingAction: () => {
    const action = get().pendingAction
    set({ pendingAction: null })
    return action
  },
}))
