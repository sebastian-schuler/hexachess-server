import { ChessHexagon } from "../types/SharedTypes";

export const isKingDead = (targetHex: ChessHexagon) => {
    return targetHex.piece?.type === "king" ? true : false;
}