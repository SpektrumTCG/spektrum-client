export interface GameState {
  isActive: boolean
  turn: number
  phase: "draw" | "main" | "battle" | "end"
}
