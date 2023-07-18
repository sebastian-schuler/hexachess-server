import 'dotenv/config';
import { WebSocketServer } from 'ws';
import { leaveLobby } from './AppServer';
import { handleRequest } from './RequestHandler';
import { Session } from './types/ServerTypes';
import { mkSession } from './util/Session';
import { ClientToServer, ServerToClient } from './types/SharedTypes';

const PORT = process.env.PORT!;

const wss = new WebSocketServer({
    port: parseInt(PORT),
});

wss.on('connection', async ws => {

    const sendData = (m: ServerToClient) => {
        ws.send(JSON.stringify(m), (err) => {
            if (err)
                console.log("send message error: ", err);
        });
    }

    let session: Session = mkSession(sendData);
    const setSession = (newSession: Session) => { session = newSession };

    ws.on("close", (code, reason) => {
        leaveLobby(session);
    });
    
    ws.on("error", () => {
        console.log("error in ws");
    });

    ws.on('message', data => {
        const req: ClientToServer = JSON.parse(data.toString());
        handleRequest({ req, session, setSession });
        // console.log("received message ", req);
    });
});