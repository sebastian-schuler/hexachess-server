import { ChessHexagon, PlayerColor, ServerToClient } from "./SharedTypes"

type GameState = {
    map: Map<string, ChessHexagon>
    currentTurn: PlayerColor
    turnCount: number
}

export type Lobby = {
    id: string
    status: "lobby" | "game"
    players: {
        hostId: number
        black: Session | null
        white: Session | null
    }
    gameState: GameState | null
}

export type Session = {
    status: "menu" | "lobby" | "game",
    id: number,
    send: (m: ServerToClient) => void
    lobbyId: string | null
}