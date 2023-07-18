import { ChessHexagon, Coords, PlayerColor } from "../types/SharedTypes";
import { coordinatesToId } from "./Helpers";

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



/**
 * Checks if a pawn is en passant
 * @param fromHex 
 * @param map 
 * @param turn 
 * @returns 
 */
export const getPawnEnPassant = (fromHex: ChessHexagon, map: Map<string, ChessHexagon>, turn: number) => {

    if (!fromHex.piece || fromHex.piece.type !== "pawn") return [];

    const { q, r, s } = fromHex.coords;

    const playerColor = fromHex.piece.player;

    const checkHexRight = playerColor === "white" ? coordinatesToId({ q: q + 1, r: r, s: s - 1 }) : coordinatesToId({ q: q + 1, r: r - 1, s: s });
    const checkHexLeft = playerColor === "white" ? coordinatesToId({ q: q - 1, r: r + 1, s: s }) : coordinatesToId({ q: q - 1, r: r, s: s + 1 });
    const hexRight = map.get(checkHexRight);
    const hexLeft = map.get(checkHexLeft);

    type EnPassantCoord = {
        moveCoords: Coords,
        captureCoords: Coords,
    }

    const result: EnPassantCoord[] = [];

    if (
        hexRight?.piece?.type === "pawn" &&
        hexRight.piece.player !== playerColor &&
        hexRight.piece.pawnDoubleStepTurn === turn - 0.5
    ) {
        result.push({
            moveCoords: playerColor === "white" ? { q: q + 1, r: r - 1, s: s } : { q: q + 1, r: r, s: s - 1 },
            captureCoords: hexRight.coords,
        });
    }

    if (
        hexLeft?.piece?.type === "pawn" &&
        hexLeft.piece.player !== playerColor &&
        hexLeft.piece.pawnDoubleStepTurn === turn - 0.5
    ) {
        result.push({
            moveCoords: playerColor === "white" ? { q: q - 1, r: r, s: s + 1 } : { q: q - 1, r: r - 1, s: s },
            captureCoords: hexLeft.coords,
        });
    }

    return result;
}