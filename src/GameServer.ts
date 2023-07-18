import { lobbies, sendLobbyUpdate } from "./AppServer";
import { getPawnEnPassant, isKingDead, isPawnDoubleStepping, isPawnPromoted } from "./gameLogic/GameChecks";
import { getPossibleMovements } from "./gameLogic/GameMovement/MovementHandler";
import { coordinatesToId } from "./gameLogic/Helpers";
import { GameState, Session } from "./types/ServerTypes";
import { GameStateUpdate, Piece } from "./types/SharedTypes";

/**
 * Moves a piece if it's the players turn
 * @param session 
 * @param idFrom 
 * @param idTo 
 * @returns 
 */
export const movePiece = (session: Session, idFrom: string, idTo: string) => {

    // Check if session is in a lobby
    if (!session.lobbyId) return;

    const lobby = lobbies.get(session.lobbyId);

    // Check if lobby exists and is in game state
    if (!lobby || lobby.status === "lobby") return;

    // Check if lobby is full
    if (!lobby.players.black || !lobby.players.white) return;

    // Get player color
    const playerColor = lobby.players.black.id === session.id ? "black" : "white";

    // Check if it's the players turn
    if (lobby.gameState?.currentTurn !== playerColor) return;

    const hexFrom = lobby.gameState.map.get(idFrom);
    const hexTo = lobby.gameState.map.get(idTo);

    // Check if hexes exist
    if (!hexFrom || !hexTo) return;

    // Check if hexFrom is a piece of the player
    if (hexFrom.piece === null || hexFrom.piece.player != playerColor) return;

    // Get en passant coords
    const enPassantCoords = getPawnEnPassant(hexFrom, lobby.gameState.map, lobby.gameState.turnCount);

    // Check if hexTo is walkable
    const possibleMoves = getPossibleMovements(hexFrom, lobby.gameState.map);
    possibleMoves.push(...enPassantCoords.map(enPassant => enPassant.moveCoords));
    if (!possibleMoves.some(coord =>
        coord.q === hexTo.coords.q &&
        coord.r === hexTo.coords.r &&
        coord.s === hexTo.coords.s
    )) return;

    if (isKingDead(hexTo)) {
        // Check if the king is dead and end the game if so
        const state = getGameStateUpdateData(lobby.gameState);
        const winner = playerColor === "black" ? "black" : "white";

        sendLobbyUpdate(lobby, { tag: "Update", update: { tag: "GameEnded", state, winner } });
    } else if (isPawnPromoted(hexFrom, hexTo)) {
        // Check if a pawn is promoted, if so promote it
        hexFrom.piece.type = "queen";
    }

    if (enPassantCoords.length > 0) {
        // Check if it's an en passant move and capture the pawn
        const enPassantCaptureCoords = enPassantCoords.find(enp =>
            enp.moveCoords.q === hexTo.coords.q &&
            enp.moveCoords.r === hexTo.coords.r &&
            enp.moveCoords.s === hexTo.coords.s
        );

        if (enPassantCaptureCoords) {
            // Get the hex of the pawn to capture
            const enPassantHex = lobby.gameState.map.get(coordinatesToId(enPassantCaptureCoords.captureCoords));
            if (enPassantHex && enPassantHex.piece) {
                // Capture the pawn
                if (enPassantHex.piece.player === "black") {
                    lobby.gameState.whiteCaptures.push(enPassantHex.piece);
                } else {
                    lobby.gameState.blackCaptures.push(enPassantHex.piece);
                }
                enPassantHex.piece = null;
            }
        }
    }

    // Move piece
    const pieceFrom = {
        ...hexFrom.piece,
    };
    pieceFrom.hasWalked = true;

    // Check if a pawn is double stepping
    if (isPawnDoubleStepping(hexFrom, hexTo)) {
        // Set the turn it double stepped
        pieceFrom.pawnDoubleStepTurn = lobby.gameState.turnCount;
    }

    if (hexTo.piece !== null) {
        // Capture piece
        if (hexTo.piece.player === "black") {
            lobby.gameState.whiteCaptures.push(hexTo.piece);
        } else {
            lobby.gameState.blackCaptures.push(hexTo.piece);
        }
    }

    // TODO use the captured arrays to display the captures on the UI, count the points and display them

    // Move piece
    hexTo.piece = pieceFrom;
    hexFrom.piece = null;

    // Update game state
    lobby.gameState.currentTurn = playerColor === "black" ? "white" : "black";
    lobby.gameState.turnCount += 0.5;

    const state = getGameStateUpdateData(lobby.gameState);

    sendLobbyUpdate(lobby, { tag: "Update", update: { tag: "GameStateUpdate", state } });
}

/**
 * Returns the game state as a GameStateUpdate
 * @param gameState 
 * @returns 
 */
const getGameStateUpdateData = (gameState: GameState) => {

    const { scoreBlack, scoreWhite } = getCaptureScores(gameState.blackCaptures, gameState.whiteCaptures);

    const state: GameStateUpdate = {
        map: JSON.stringify(Array.from(gameState.map.entries())),
        currentTurn: gameState.currentTurn,
        turnCount: gameState.turnCount,
        blackCaptures: gameState.blackCaptures.map(piece => piece.type),
        whiteCaptures: gameState.whiteCaptures.map(piece => piece.type),
        scoreBlack,
        scoreWhite,
    }
    return state;
}

/**
 * Calculates the score of the captures based on the worth of the pieces
 * @param capturesBlack 
 * @param capturesWhite 
 * @returns 
 */
const getCaptureScores = (capturesBlack: Piece[], capturesWhite: Piece[]) => {

    let totalScoreBlack = 0;
    for (const piece of capturesBlack) {
        totalScoreBlack += piece.worth;
    }

    let totalScoreWhite = 0;
    for (const piece of capturesWhite) {
        totalScoreWhite += piece.worth;
    }

    return {
        scoreBlack: totalScoreBlack - totalScoreWhite,
        scoreWhite: totalScoreWhite - totalScoreBlack
    };
}