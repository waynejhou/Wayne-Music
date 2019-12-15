import { Event } from "electron";

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

export class AppIPCRenderer {
    private _ws: WebSocket = null;
    private _onCallbacks: { [id: string]: (request: string, data: any) => void; } = {}
    public constructor(ws: WebSocket, onOpen: (ev: Event) => void, onClose: (ev: Event) => void) {
        this._ws = ws
        this._ws.onopen = onOpen;
        this._ws.onclose = onClose;
        this._ws.onmessage = (ev) => {
            let msg = <AppIPCMessage>JSON.parse(ev.data)
            if (msg.Receiver != "Renderer") return
            if (this._onCallbacks[msg.Action]) this._onCallbacks[msg.Action](msg.Request, msg.Data);
        }
    }

    public Send(msg: AppIPCMessage) {
        if (msg.Receiver == "Audio") {
            this._ws.send(JSON.stringify(msg))
        }
    }

    public Send2Audio(action: string, request: string, data: any) {
        let msg = new AppIPCMessage("Audio", action, request);
        msg.Data = data;
        this.Send(msg);
    }
    public On(action: string, callback: (request: string, data: any) => void): void {
        this._onCallbacks[action] = callback;
    }

}