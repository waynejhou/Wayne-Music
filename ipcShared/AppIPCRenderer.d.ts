import { Event } from "electron";

export class AppIPCMessage {
    public Receiver: string ;
    public Action: string ;
    public Request: string ;
    public Data: any ;
    public Channel: string ;
    constructor(receiver: string, action: string, request: string)
}

export class AppIPCRenderer {
    private _ws: WebSocket 
    private _onCallbacks: { [id: string]: (request: string, data: any) => void; }
    public constructor(ws: WebSocket, onOpen: (ev: Event) => void, onClose: (ev: Event) => void)

    public Send(msg: AppIPCMessage)  :void
    public Send2Audio(action: string, request: string, data: any) :void
    public On(action: string, callback: (request: string, data: any) => void): void
}