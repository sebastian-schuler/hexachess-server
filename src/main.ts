import 'dotenv/config';
// import express from 'express';
import { WebSocketServer } from 'ws';
import { leaveLobby } from './AppServer';
import { handleRequest } from './RequestHandler';
import { Session } from './types/ServerTypes';
import { mkSession } from './util/Session';
import { ClientToServer, ServerToClient } from './types/SharedTypes';

// const app = express();
const PORT = process.env.PORT!;

const wss = new WebSocketServer({
    port: parseInt(PORT),
});

wss.on('connection', async ws => {
    console.log("Got WS Connection");

    const sendData = (m: ServerToClient) => {
        ws.send(JSON.stringify(m), (err) => {
            if (err)
                console.log("SendMsg fehler: " + err);
        });
    }

    let session: Session = mkSession(sendData);
    const setSession = (newSession: Session) => { session = newSession };

    ws.on("close", (code, reason) => {
        // TODO: behandeln
        console.log("closed")
        // TODO leave game
        if (session.status === "lobby") {
            leaveLobby(session);
        }
    });
    ws.on("error", () => {
        // TODO: behandeln
        console.log("error in ws");
    });

    ws.on('message', data => {
        const req: ClientToServer = JSON.parse(data.toString());
        handleRequest({ req, session, setSession });
        console.log("received message ", req);
    });
});