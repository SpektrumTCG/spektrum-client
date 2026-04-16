// src/services/cards.ts
import { api } from "./api"

export interface CardData {
  id: string
  name: string
  element: string
  rarity: string
  imageUrl: string
}

export const cardsService = {
  getAll: () => api.get<CardData[]>("/api/cards"),
  getByIds: (ids: string[]) =>
    api.post<CardData[]>("/api/cards/batch", { ids }),
  getOwned: (walletAddress: string) =>
    api.get<CardData[]>(`/api/cards/owned/${walletAddress}`),
}
