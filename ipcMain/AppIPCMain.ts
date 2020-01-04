import { BrowserWindow, WebContents, IpcMain } from "electron";
import { Server as WebSocketServer } from 'ws'
import { IAppIPCHost } from "./AppIPCHosts/IAppIPCHost";

export class AppIPCMessage {
    public Sender: string = null;
    public Receiver: string = null;
    public Action: string = null;
    public Request: string = null;
    public Data: any = null;
    public Channel: string = null;
    constructor(sender: string, receiver: string, action: string, request: string) {
        this.Sender = sender
        this.Receiver = receiver
        this.Action = action
        this.Request = request
        this.Channel = `${this.Sender}-${this.Receiver}-${this.Action}-${this.Request}`
    }
}
export class AppIPCMain {
    private _audioWindow: BrowserWindow = null;
    private _wsServer: WebSocketServer = null;
    private _hosts: IAppIPCHost[] = [];
    private _ipcMain: IpcMain = null;

    public constructor(audioWindow: BrowserWindow, wss: WebSocketServer, ipcMain:IpcMain) {
        this._audioWindow = audioWindow;
        this._wsServer = wss;
        this._ipcMain = ipcMain
        this.InitCallbacks();
    }

    private InitCallbacks(): void {
        this._wsServer.on("connection", (socket, request) => {
            console.log('Client connected')
            socket.on("message", (data) => {
                let msg = <AppIPCMessage>JSON.parse(<string>data);
                let receiverExist = false;
                this._hosts.forEach((host) => {
                    if (host.HostName == msg.Receiver) {
                        receiverExist = true
                        host.OnGotMsg(msg);
                    }
                })
                if (!receiverExist) {
                    console.log(`Message got on channel "${msg.Channel}" without handling.`)
                }
            })
            socket.on('close', () => {
                console.log('Close connected')
            })
        })
        this._ipcMain.on("FromAudio",(ev,msg)=>{
            let receiverExist = false;
            this._hosts.forEach((host) => {
                if (host.HostName == msg.Receiver) {
                    receiverExist = true
                    host.OnGotMsg(msg);
                }
            })
            if (!receiverExist) {
                console.log(`Message got on channel "${msg.Channel}" without handling.`)
            }
        })
    }

    public Send(msg: AppIPCMessage) {
        if (msg.Receiver == "Audio") {
            this._audioWindow.webContents.send("FromWebSocket", msg)
        }
        if (msg.Receiver == "Renderer") {
            this._wsServer.clients.forEach((client) => {
                client.send(JSON.stringify(msg))
            })
        }
    }

    public RegisterHost(host: IAppIPCHost) {
        this._hosts.push(host)
    }


}