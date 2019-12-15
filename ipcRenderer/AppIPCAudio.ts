import { Server as WebSocketServer } from 'ws';
import { Remote, remote } from 'electron';

export class AppIPCMessage {
    public Receiver: string = null;
    public Action: string = null;
    public Request: string = null;
    public Data: any = null;
    constructor(receiver: string, action: string, request: string) {
        this.Receiver = receiver
        this.Action = action
        this.Request = request
    }
    public get Channel(): string { return `${this.Receiver}-${this.Action}-${this.Channel}` }
}

export class AppIPCAudio {
    private _wsServer: WebSocketServer = null;
    public constructor(wss: WebSocketServer) {
        this._wsServer = wss
    }

    public Send(msg: AppIPCMessage) {
        if (msg.Receiver == "Renderer") {
            this._wsServer.clients.forEach((client) => {
                client.send(JSON.stringify(msg))
            })
        }
    }
    public SendBatch(receiver: string, msgs: AppIPCMessage[]) {
        if (receiver == "Renderer") {
            this._wsServer.clients.forEach((client) => {
                client.send(JSON.stringify(msgs))
            })
        }
    }
    public Send2Renderer(action: string, request: string, data: any) {
        let msg = new AppIPCMessage("Renderer", action, request);
        msg.Data = data;
        this.Send(msg);
    }
}