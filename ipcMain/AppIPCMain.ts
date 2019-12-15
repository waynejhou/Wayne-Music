import { BrowserWindow } from "electron";
import { Server as WebSocketServer } from 'ws'

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
export class AppIPCMain {
    private _audioWindow: BrowserWindow = null;
    private _wsServer: WebSocketServer = null;

    public constructor(audioWindow: BrowserWindow, wss: WebSocketServer) {
        this._audioWindow = audioWindow;
        this._wsServer = wss;
        this.InitCallbacks();
    }

    private InitCallbacks(): void {
        this._wsServer.on("connection", (socket, request) => {
            console.log('Client connected')
            socket.on("message", (data) => {
                let message = <AppIPCMessage>JSON.parse(<string>data)
                if (message.Receiver == "Audio") {
                    this.Send(message);
                } else {
                    console.log(`Message got from channel ${message.Channel} and without handling.`)
                }
            })
            socket.on('close', () => {
                console.log('Close connected')
            })
        })
    }

    public Send(msg: AppIPCMessage) {
        if (msg.Receiver == "Audio") {
            this._audioWindow.webContents.send("FromWebSocket", msg)
        }
    }
    public SendBatch(receiver: string, msgs: AppIPCMessage[]) {
        if (receiver == "Audio") {
            this._audioWindow.webContents.send("BatchFromWebSocket", msgs)
        }
    }
    public Send2Audio(action: string, request: string, data: any) {
        let msg = new AppIPCMessage("Audio", action, request);
        msg.Data = data;
        this.Send(msg);
    }

}