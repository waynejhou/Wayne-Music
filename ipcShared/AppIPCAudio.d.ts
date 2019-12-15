import { Server as WebSocketServer } from 'ws';
import { IpcRenderer } from 'electron';

export class AppIPCMessage {
    public Receiver: string;
    public Action: string;
    public Request: string;
    public Data: any;
    public Channel: string;
    constructor(receiver: string, action: string, request: string)
}

export class AppIPCAudio {
    private _wsServer: WebSocketServer;
    private _ipcRenderer: IpcRenderer;
    public constructor(wss: WebSocketServer, ipcRenderer: IpcRenderer)

    public Send(msg: AppIPCMessage): void
    public Send2Renderer(action: string, request: string, data: any): void
    public On(action:string, callback: (request: string, data: any) => void): void
}
