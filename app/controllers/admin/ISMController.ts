import WebSocket from "ws";
import AuthenticatedRequest from "../../interfaces/AuthenticatedRequest";

class ISMController {
    public async messageEventHandler(socket: WebSocket, req: AuthenticatedRequest) {}

    public async seenEventHandler(socket: WebSocket, req: AuthenticatedRequest) {}
}

export default ISMController;
