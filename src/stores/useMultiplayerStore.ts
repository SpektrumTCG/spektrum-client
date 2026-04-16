import { create } from "zustand"

type LobbyStatus = "idle" | "searching" | "found" | "in-game"

interface MultiplayerStore {
  status: LobbyStatus
  roomId: string | null
  opponentAddress: string | null
  setStatus: (status: LobbyStatus) => void
  setRoom: (roomId: string, opponentAddress: string) => void
  reset: () => void
}

export const useMultiplayerStore = create<MultiplayerStore>()((set) => ({
  status: "idle",
  roomId: null,
  opponentAddress: null,
  setStatus: (status) => set({ status }),
  setRoom: (roomId, opponentAddress) => set({ roomId, opponentAddress, status: "found" }),
  reset: () => set({ status: "idle", roomId: null, opponentAddress: null }),
}))
