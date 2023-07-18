import { generateMap } from "./gameLogic/Board";
import { Lobby, Session } from "./types/ServerTypes";
import { GameStateUpdate, ServerToClient } from "./types/SharedTypes";
import { getRandomId } from "./util/Helpers";

export const lobbies = new Map<string, Lobby>();

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
                const otherPlayer = lobby.players.black === null ? lobby.players.white : lobby.players.black;
                if (!otherPlayer) return;

                if (lobby.status === "game") {
                    otherPlayer.status = "menu";
                    otherPlayer.lobbyId = null;
                    lobbies.delete(lobby.id);
                } else {
                    lobby.players.hostId = otherPlayer.id;
                }

                otherPlayer.send({ tag: "Update", update: { tag: "PlayerLeft" } });
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
    if (color === "black") {
        lobby.players.black = session
    } else {
        lobby.players.white = session
    }

    session.status = "lobby";
    session.lobbyId = lobby.id;
    session.send({ tag: "Response", response: { tag: "JoinedLobby", id: lobby.id, playerColor: color } });

    // Send update to other player
    const otherPlayer = color === "black" ? lobby.players.white : lobby.players.black;
    otherPlayer?.send({ tag: "Update", update: { tag: "PlayerJoined" } });
}

export const swapPlayerColors = (session: Session) => {

    // Check if session is in a lobby
    if (!session.lobbyId) return;

    const lobby = lobbies.get(session.lobbyId);

    // Check if lobby exists and is in lobby state
    if (!lobby || lobby.status === "game") return;

    // Check if player is host
    if (lobby.players.hostId !== session.id) return;

    // Swap player colors
    const temp = lobby.players.black;
    lobby.players.black = lobby.players.white;
    lobby.players.white = temp;

    // Send update to both players
    sendLobbyUpdate(lobby, { tag: "Update", update: { tag: "PlayerSwapped", } });
}

/**
 * Starts the game if the lobby is full
 * @param session 
 * @returns 
 */
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
        currentTurn: "white",
        turnCount: 0,
        blackCaptures: [],
        whiteCaptures: []
    }

    const state: GameStateUpdate = {
        map: JSON.stringify(Array.from(lobby.gameState.map.entries())),
        currentTurn: lobby.gameState.currentTurn,
        turnCount: lobby.gameState.turnCount,
        blackCaptures: lobby.gameState.blackCaptures.map(piece => piece.type),
        whiteCaptures: lobby.gameState.whiteCaptures.map(piece => piece.type),
        scoreBlack: 0,
        scoreWhite: 0,
    }

    // Send update to both players
    sendLobbyUpdate(lobby, { tag: "Update", update: { tag: "GameStarted", state } });
}

/*****************************************************************
 *
 * Helper Functions
 *
 ****************************************************************/

export const sendLobbyUpdate = (lobby: Lobby, m: ServerToClient) => {
    lobby.players.black?.send(m);
    lobby.players.white?.send(m);
}