import { BrowserWindow } from "electron";
import { Server as WebSocketServer } from 'ws'

function isArray(what: any) {
    return Object.prototype.toString.call(what) === '[object Array]';
}

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
                let msg = <AppIPCMessage>JSON.parse(<string>data);
                if (msg.Receiver == "Audio") {
                    this.Send(msg);
                } else {
                    console.log(`Message got from channel "${msg.Channel}" and without handling.`)
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
    public Send2Audio(action: string, request: string, data: any) {
        let msg = new AppIPCMessage("Audio", action, request);
        msg.Data = data;
        this.Send(msg);
    }

}