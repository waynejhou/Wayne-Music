import { IHost } from "../AppHost";
import * as AppIpc from "../AppIpc"
import { App } from "electron";
import { Session } from "../AppSession";

export class LaunchInfo {
    [key: string]: any
}

export class SessionCenter{
    private sessSet: {[name:string]:Session}
    private lastFocusSessName: string

    public constructor(){
        this.lastFocusSessName = null;
        this.sessSet = {};
    }

    public add(sess:Session){
        this.sessSet[sess.name] = sess
        this.changeLastFocus(sess.name)
    }
    public remove(name:string){
        delete this.sessSet[name]
    }
    public changeLastFocus(name:string){
        if(name in this.sessSet){
            this.lastFocusSessName = name
        }
    }

    public get(name:string){
        return this.sessSet[name]
    }

    public get length(){
        return Object.keys(this.sessSet).length
    }

    public get lastFocusSess(){
        if(this.lastFocusSessName){
            return this.sessSet[this.lastFocusSessName]
        }
        return null;
    }
}


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

    public on(event: "electron-ready", callback: (launchInfo: LaunchInfo) => void): void;
    public on(event: "electron-window-all-closed", callback: () => void): void;
    public on(event: "electron-activate", callback: () => void): void;
    public on(event: "session-ready", callback: (sender:string) => void): void;
    public on(event: "session-focus", callback: (sender:string) => void): void;
    public on(event: string, callback: any) {
        switch (event) {
            case "electron-ready":
                this.app.on('ready', callback)
                break;
            case "electron-window-all-closed":
                this.app.on('window-all-closed', callback)
                break
            case "electron-activate":
                this.app.on('activate', callback)
                break
            default:
                if (!this.onCallbacks[event]) {
                    this.onCallbacks[event] = []
                }
                this.onCallbacks[event].push(callback)
                break;
        }
    }
    public once(event: "electron-ready", callback: (launchInfo: LaunchInfo) => void): void;
    public once(event: "electron-window-all-closed", callback: () => void): void;
    public once(event: "electron-activate", callback: () => void): void;
    public once(event: "session-ready", callback: () => void): void;
    public once(event: "session-focus", callback: () => void): void;
    public once(event: string, callback: any) {
        switch (event) {
            case "electron-ready":
                this.app.once('ready', callback)
                break;
            case "electron-window-all-closed":
                this.app.once('window-all-closed', callback)
                break
            case "electron-activate":
                this.app.once('activate', callback)
                break
            default:
                if (!this.onceCallbacks[event]) {
                    this.onceCallbacks[event] = []
                }
                this.onceCallbacks[event].push(callback)
                break;
        }
    }

    
}

