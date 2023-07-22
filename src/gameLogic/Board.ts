import { ChessHexagon, Coords } from "../types/SharedTypes";
import { coordinatesToId } from "./Helpers";
import { getInitialPieces } from "./InitialBoard";

const GRID_SIZE = 6;

export const generateMap = () => {

    const map = new Map<string, ChessHexagon>();

    // Generate hexagon coordinates
    for (let q = -GRID_SIZE + 1; q < GRID_SIZE; q++) {
        const r1 = Math.max(-GRID_SIZE + 1, -q - GRID_SIZE + 1);
        const r2 = Math.min(GRID_SIZE - 1, -q + GRID_SIZE - 1);
        for (let r = r1; r <= r2; r++) {
            const s = -q - r;
            map.set(coordinatesToId({ q, r, s }), {
                coords: { q, r, s },
                coords2D: { x: 0, y: 0 },
                color: 'white',
                piece: null,
                isSelected: false,
                isWalkable: false,
            });
        }
    }

    // Set up pieces
    const initialPieces = getInitialPieces();
    initialPieces.forEach((entry) => {
        const hexa = map.get(coordinatesToId({ q: entry.q, r: entry.r, s: entry.s }));
        if (hexa) {
            hexa.piece = {
                id: entry.id,
                type: entry.type,
                player: entry.player,
                hasWalked: false,
                worth: entry.worth!,
            };
            map.set(coordinatesToId({ q: entry.q, r: entry.r, s: entry.s }), hexa);
        }
    });

    const size = 5;
    let nextColor = 'white';
    let colStartColor = 'white';

    // Set up colors
    for (let q = -size; q <= size; q++) {

        // Get min and max y values
        const yMin = q <= 0 ? Math.max(-size, -q - size) : -size;
        const yMax = q <= 0 ? Math.min(size, -q + size) : size - q;

        for (let r = yMin; r <= yMax; r++) {
            const s = -q - r;

            const id = coordinatesToId({ q, r, s });
            const chessHexa = map.get(id);

            if (chessHexa) {
                chessHexa.color = nextColor;
                map.set(id, chessHexa);
            }

            nextColor = getNextColor(nextColor);
        }

        // Change color of next column start
        colStartColor = getNextColor(colStartColor, q + 1 > 0);
        nextColor = colStartColor;
    }

    // Set 2D coordinates
    get2DCoords(map);

    return map;
}

/**
 * Returns the next color in the sequence
 * @param lastColor 
 * @param reverse 
 * @returns 
 */
const getNextColor = (lastColor: string, reverse?: boolean) => {
    if (reverse) {
        if (lastColor === 'white') return 'black';
        if (lastColor === 'gray') return 'white';
        if (lastColor === 'black') return 'gray';
    }
    if (lastColor === 'white') return 'gray';
    if (lastColor === 'gray') return 'black';
    if (lastColor === 'black') return 'white';
    return 'none';
}

/**
 * Sets the 2D coordinates of each hexagon
 * @param map 
 */
const get2DCoords = (map: Map<string, ChessHexagon>) => {

    let rowCounter = 0;
    let lastCol = 0;

    map.forEach((hexa) => {

        if (lastCol !== hexa.coords.q) {
            rowCounter = 0;
            lastCol = hexa.coords.q;
        }

        rowCounter++;

        hexa.coords2D = {
            x: hexa.coords.q + GRID_SIZE,
            y: rowCounter,
        }
    });
}