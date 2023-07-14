import { Session } from "../types/ServerTypes";
import { ServerToClient } from "../types/SharedTypes";

let lastID = 1;

export function mkSession(send: (m: ServerToClient) => void): Session {
    return { 
        id: lastID++, 
        status: "menu", 
        send,
        lobbyId: null
    }
}
