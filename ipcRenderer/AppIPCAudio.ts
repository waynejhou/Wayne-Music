import { Server as WebSocketServer } from 'ws';
import { IpcRenderer } from 'electron';

export class AppIPCMessage {
    public Receiver: string = null;
    public Action: string = null;
    public Request: string = null;
    public Data: any = null;
    public Channel: string = null;
    constructor(receiver: string, action: string, request: string) {
        this.Receiver = receiver
        this.Action = action
        this.Request = request
        this.Channel = `${this.Receiver}-${this.Action}-${this.Request}`
    }
}

export class AppIPCAudio {
    private _wsServer: WebSocketServer = null;
    private _ipcRenderer: IpcRenderer = null;
    private _onCallbacks: { [id: string]: (request: string, data: any) => void; } = {}
    private _onGetRemote: (request: string, data: any) => void = null;
    public constructor(wss: WebSocketServer, ipcRenderer: IpcRenderer) {
        console.log("app")
        this._wsServer = wss
        this._ipcRenderer = ipcRenderer
        this._ipcRenderer.on("FromWebSocket", (ev, msg: AppIPCMessage) => {
            if (msg.Receiver != "Audio") return
            if(this._onCallbacks[msg.Action]) this._onCallbacks[msg.Action](msg.Request, msg.Data);
        });
    }

    public Send(msg: AppIPCMessage): void {
        if (msg.Receiver == "Renderer") {
            this._wsServer.clients.forEach((client) => {
                client.send(JSON.stringify(msg))
            })
        }
    }

    public Send2Renderer(action: string, request: string, data: any): void {
        let msg = new AppIPCMessage("Renderer", action, request);
        msg.Data = data;
        this.Send(msg);
    }
    public On(action:string, callback: (request: string, data: any) => void): void {
        this._onCallbacks[action] = callback;
    }

}
