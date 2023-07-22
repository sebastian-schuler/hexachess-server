import { ChessHexagon, Piece, PlayerColor, ServerToClient } from "./SharedTypes"

export type GameState = {
    map: Map<string, ChessHexagon>
    currentTurn: PlayerColor
    turnCount: number
    blackCaptures: Piece[]
    whiteCaptures: Piece[]
}

export type Lobby = {
    id: string
    status: "lobby" | "game"
    randomizeColor: boolean
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