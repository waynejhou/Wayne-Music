import { IHost } from "../AppHost";
import * as AppIpc from "../AppIpc"
import { App } from "electron";
import { Session } from "../AppSession";






export class StatusHost implements IHost {

    public hostName: string;
    private app: App;
    private onCallbacks: { [key: string]: Function[] }
    private onceCallbacks: { [key: string]: Function[] }

    public constructor(app: App) {
        this.app = app
        this.onCallbacks = {}
        this.onceCallbacks = {}
    }

    public onGotMsg(msg: AppIpc.Message) {
        for (let index = 0; index < msg.commands.length; index++) {
            const cmd = msg.commands[index];
            if (cmd.action == "fire") {
                if(this.onCallbacks[cmd.request]){
                    this.onCallbacks[cmd.request].forEach(v=>v(cmd.data))
                }
                if(this.onceCallbacks[cmd.request]){
                    this.onceCallbacks[cmd.request].forEach(v=>v(cmd.data))
                    this.onceCallbacks[cmd.request] = undefined;
                }
            }
        }
    }

    

    
}

