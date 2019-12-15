
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
    private _ws: WebSocket = null;
    public constructor(ws: WebSocket) {
        this._ws = ws
    }

    public Send(msg: AppIPCMessage) {
        if (msg.Receiver == "Audio") {
            this._ws.send(JSON.stringify(msg))
        }
    }
    public SendBatch(receiver: string, msgs: AppIPCMessage[]) {
        if (receiver == "Audio") {
            this._ws.send(JSON.stringify(msgs))
        }
    }
    public Send2Audio(action: string, request: string, data: any) {
        let msg = new AppIPCMessage("Audio", action, request);
        msg.Data = data;
        this.Send(msg);
    }
}