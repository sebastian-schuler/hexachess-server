import { ChessHexagon, Coords, PieceType } from "../types/SharedTypes";

export const coordinatesToId = (coords: Coords) => {
    return `${coords.q};${coords.r};${coords.s}`;
}

export const getHexId = (hex: ChessHexagon) => {
    return `${hex.coords.q};${hex.coords.r};${hex.coords.s}`;
}

export const isValidCoordinates = (c: Coords) => {
    const MAX = 6 - 1;
    if (c.q < -MAX || c.r < -MAX || c.s < -MAX) return false;
    if (c.q > MAX || c.r > MAX || c.s > MAX) return false;
    return (c.q + c.r + c.s) === 0;
}

export const getPieceWorth = (type: PieceType) => {
    switch (type) {
        case "pawn": return 1;
        case "knight": return 3;
        case "bishop": return 3;
        case "rook": return 5;
        case "queen": return 9;
        case "king": return 0;
    }
}