import { PieceType, PlayerColor } from "../types/SharedTypes";

type PieceEntry = {
    id: string,
    q: number,
    r: number,
    s: number,
    player: PlayerColor,
    type: PieceType
}

export const getInitialPieces = () => {

    const pieces: PieceEntry[] = [

        // White Pawns
        { id: 'WP1', q: -4, r: 5, s: -1, player: 'white', type: 'pawn' },
        { id: 'WP2', q: -3, r: 4, s: -1, player: 'white', type: 'pawn' },
        { id: 'WP3', q: -2, r: 3, s: -1, player: 'white', type: 'pawn' },
        { id: 'WP4', q: -1, r: 2, s: -1, player: 'white', type: 'pawn' },
        { id: 'WP5', q: 0, r: 1, s: -1, player: 'white', type: 'pawn' },
        { id: 'WP6', q: 1, r: 1, s: -2, player: 'white', type: 'pawn' },
        { id: 'WP7', q: 2, r: 1, s: -3, player: 'white', type: 'pawn' },
        { id: 'WP8', q: 3, r: 1, s: -4, player: 'white', type: 'pawn' },
        { id: 'WP9', q: 4, r: 1, s: -5, player: 'white', type: 'pawn' },

        // White Rooks
        { id: 'WR1', q: -3, r: 5, s: -2, player: 'white', type: 'rook' },
        { id: 'WR2', q: 3, r: 2, s: -5, player: 'white', type: 'rook' },

        // White Knights
        { id: 'WK1', q: -2, r: 5, s: -3, player: 'white', type: 'knight' },
        { id: 'WK2', q: 2, r: 3, s: -5, player: 'white', type: 'knight' },

        // White Bishops
        { id: 'WB1', q: 0, r: 3, s: -3, player: 'white', type: 'bishop' },
        { id: 'WB2', q: 0, r: 4, s: -4, player: 'white', type: 'bishop' },
        { id: 'WB3', q: 0, r: 5, s: -5, player: 'white', type: 'bishop' },

        // White Queen and King
        { id: 'WQ', q: -1, r: 5, s: -4, player: 'white', type: 'queen' },
        { id: 'WK', q: 1, r: 4, s: -5, player: 'white', type: 'king' },

        // ==============================================

        // Black Pawns
        { id: 'BP1', q: -4, r: -1, s: 5, player: 'black', type: 'pawn' },
        { id: 'BP2', q: -3, r: -1, s: 4, player: 'black', type: 'pawn' },
        { id: 'BP3', q: -2, r: -1, s: 3, player: 'black', type: 'pawn' },
        { id: 'BP4', q: -1, r: -1, s: 2, player: 'black', type: 'pawn' },
        { id: 'BP5', q: 0, r: -1, s: 1, player: 'black', type: 'pawn' },
        { id: 'BP6', q: 1, r: -2, s: 1, player: 'black', type: 'pawn' },
        { id: 'BP7', q: 2, r: -3, s: 1, player: 'black', type: 'pawn' },
        { id: 'BP8', q: 3, r: -4, s: 1, player: 'black', type: 'pawn' },
        { id: 'BP9', q: 4, r: -5, s: 1, player: 'black', type: 'pawn' },

        // Black Rooks
        { id: 'BR1', q: -3, r: -2, s: 5, player: 'black', type: 'rook' },
        { id: 'BR2', q: 3, r: -5, s: 2, player: 'black', type: 'rook' },

        // Black Knights
        { id: 'BK1', q: -2, r: -3, s: 5, player: 'black', type: 'knight' },
        { id: 'BK2', q: 2, r: -5, s: 3, player: 'black', type: 'knight' },

        // Black Bishops
        { id: 'BB1', q: 0, r: -3, s: 3, player: 'black', type: 'bishop' },
        { id: 'BB2', q: 0, r: -4, s: 4, player: 'black', type: 'bishop' },
        { id: 'BB3', q: 0, r: -5, s: 5, player: 'black', type: 'bishop' },

        // Black Queen and King
        { id: 'BQ', q: -1, r: -4, s: 5, player: 'black', type: 'queen' },
        { id: 'BK', q: 1, r: -5, s: 4, player: 'black', type: 'king' },
    ];

    return pieces;
}