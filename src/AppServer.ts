import { generateMap } from "./gameLogic/Board";
import { getPossibleMovements } from "./gameLogic/GameMovement/MovementHandler";
import { Lobby, Session } from "./types/ServerTypes";
import { GameStateUpdate, ServerToClient } from "./types/SharedTypes";
import { getRandomId } from "./util/Helpers";

const lobbies = new Map<string, Lobby>();

/*****************************************************************
 *
 * Server Functions
 *
 ****************************************************************/

/**
 * Creates a new lobby and sets the sessions status to "lobby"
 * @param session 
 */
export const createLobby = (session: Session) => {

    // Generate a random id for the lobby that is not already in use
    let id = getRandomId();
    while (lobbies.has(id)) {
        id = getRandomId();
    }

    // Create the lobby
    const newLobby: Lobby = {
        id,
        status: "lobby",
        players: {
            hostId: session.id,
            black: session,
            white: null
        },
        gameState: null
    }

    session.status = "lobby";
    session.lobbyId = newLobby.id;

    lobbies.set(newLobby.id, newLobby);
    session.send({ tag: "Response", response: { tag: "CreatedLobby", id: newLobby.id, playerColor: 'black' } });
}

/**
 * Removes the session from the lobby and deletes the lobby if no players are left
 * @param session 
 */
export const leaveLobby = (session: Session) => {

    if (session.lobbyId) {
        const lobby = lobbies.get(session.lobbyId);

        if (lobby) {

            if (lobby.players.black?.id === session.id) {
                lobby.players.black = null;

            } else if (lobby.players.white?.id === session.id) {
                lobby.players.white = null;
            }

            if (lobby.players.black === null && lobby.players.white === null) {
                // delete lobby if no players are left
                lobbies.delete(lobby.id);
            } else {

                // send update to other player
                if (lobby.players.white) {
                    lobby.players.white.send({ tag: "Update", update: { tag: "PlayerLeft" } });
                } else if (lobby.players.black) {
                    lobby.players.black?.send({ tag: "Update", update: { tag: "PlayerLeft" } });
                }

            }
        }
    }

    session.status = "menu";
    session.lobbyId = null;
}

/**
 * Joins a lobby if it exists and is not full
 * @param session 
 * @param id 
 * @returns 
 */
export const joinLobby = (session: Session, id: string) => {

    // Check if lobby exists
    if (!lobbies.has(id)) {
        session.send({ tag: "Response", response: { tag: "Error", code: "invalidLobbyId" } });
        return;
    }

    const lobby = lobbies.get(id)!;

    // Check if lobby is full
    if (lobby?.players.black && lobby?.players.white) {
        session.send({ tag: "Response", response: { tag: "Error", code: "lobbyFull" } });
        return;
    }

    const color = lobby?.players.black === null ? "black" : "white";

    // Join lobby
    if (color === "black")
        lobby.players.black = session
    else
        lobby.players.white = session

    session.status = "lobby";
    session.lobbyId = lobby.id;
    session.send({ tag: "Response", response: { tag: "JoinedLobby", id: lobby.id, playerColor: color } });

    // Send update to other player
    const otherPlayer = color === "black" ? lobby.players.white : lobby.players.black;
    otherPlayer?.send({ tag: "Update", update: { tag: "PlayerJoined" } });
    console.log(otherPlayer);
}

export const startGame = (session: Session) => {

    // Check if session is in a lobby
    if (!session.lobbyId) return;

    const lobby = lobbies.get(session.lobbyId);

    // Check if lobby exists and is in lobby state
    if (!lobby || lobby.status === "game") return;

    // Check if lobby is full
    if (!lobby.players.black || !lobby.players.white) return;

    lobby.status = "game";
    lobby.gameState = {
        map: generateMap(6),
        currentTurn: "black",
        turnCount: 0
    }

    const state: GameStateUpdate = {
        map: JSON.stringify(Array.from(lobby.gameState.map.entries())),
        currentTurn: lobby.gameState.currentTurn,
        turnCount: lobby.gameState.turnCount
    }

    // Send update to both players
    sendLobbyUpdate(lobby, { tag: "Update", update: { tag: "GameStarted", state } });
}

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

    // Check if hexTo is walkable
    const possibleMoves = getPossibleMovements(hexFrom, lobby.gameState.map);
    console.log(possibleMoves);
    if (!possibleMoves.some(coord =>
        coord.q === hexTo.coords.q &&
        coord.r === hexTo.coords.r &&
        coord.s === hexTo.coords.s
    )) return;

    // Move piece
    const pieceFrom = {
        ...hexFrom.piece,
    };
    pieceFrom.hasWalked = true;
    hexTo.piece = pieceFrom;
    hexFrom.piece = null;

    // Update game state
    lobby.gameState.currentTurn = playerColor === "black" ? "white" : "black";
    lobby.gameState.turnCount += 0.5;

    const state: GameStateUpdate = {
        map: JSON.stringify(Array.from(lobby.gameState.map.entries())),
        currentTurn: lobby.gameState.currentTurn,
        turnCount: lobby.gameState.turnCount
    }

    sendLobbyUpdate(lobby, { tag: "Update", update: { tag: "GameStateUpdate", state } });
}

/*****************************************************************
 *
 * Helper Functions
 *
 ****************************************************************/

const sendLobbyUpdate = (lobby: Lobby, m: ServerToClient) => {
    lobby.players.black?.send(m);
    lobby.players.white?.send(m);
}