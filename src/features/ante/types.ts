export type AnteStatus = "idle" | "searching" | "matched" | "in-game"

export interface AnteMatch {
  roomId: string
  opponentAddress: string
  stakeAmount: number
}
