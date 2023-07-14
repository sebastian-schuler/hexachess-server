import { createLobby, joinLobby, leaveLobby, movePiece, startGame } from "./AppServer";
import { Session } from "./types/ServerTypes";
import { ClientToServer } from "./types/SharedTypes";

type HandleRequestProps = {
    req: ClientToServer
    session: Session
    setSession?: (newSession: Session) => void
}

export async function handleRequest({ req, session, setSession }: HandleRequestProps) {

    switch (req.tag) {

        case "CreateLobby":
            createLobby(session);
            break;
        case "LeaveLobby":
            leaveLobby(session);
            break;
        case "JoinLobby":
            joinLobby(session, req.id);
            break;
        case "StartGame":
            startGame(session);
            break;
        case "MovePiece":
            movePiece(session, req.idFrom, req.idTo);
            break;
    }
}