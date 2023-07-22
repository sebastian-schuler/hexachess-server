import { ChessHexagon } from "../types/SharedTypes";

/**
 * Checks if the player just captured the king and won the game
 * @param targetHex 
 * @returns 
 */
export const isKingDead = (targetHex: ChessHexagon) => {
    return targetHex.piece?.type === "king" ? true : false;
}

/**
 * Checks if the players piece is a pawn and is on the last row on the opponents side
 * @param targetHex 
 * @param playerColor 
 * @returns 
 */
export const isPawnPromoted = (fromHex: ChessHexagon, targetHex: ChessHexagon) => {

    if (!fromHex.piece || fromHex.piece.type !== "pawn") return false;

    const { r, s } = targetHex.coords;
    const playerColor = fromHex.piece.player;

    if (playerColor === "white" && (s === 5 || r === -5)) {
        return true;
    }

    if (playerColor === "black" && (s === -5 || r === 5)) {
        return true;
    }

    return false;
}

/**
 * Checks if a pawn is double stepping
 * @param fromHex 
 * @param targetHex 
 * @returns 
 */
export const isPawnDoubleStepping = (fromHex: ChessHexagon, targetHex: ChessHexagon) => {

    if (!fromHex.piece || fromHex.piece.type !== "pawn") return false;

    const { r: targetR, s: targetS } = targetHex.coords;
    const { r: fromR, s: fromS } = fromHex.coords;

    if (Math.abs(fromS - targetS) >= 2 || Math.abs(fromR - targetR) >= 2) return true;
    return false;
}