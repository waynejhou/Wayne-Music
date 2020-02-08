import { App } from "electron";
import * as AppIpc from '../AppIpc'
import * as AppHost from '../AppHost'

export class StatusHost implements AppHost.IHost {
    private app: App;
    private onCallbacks: { [key: string]: Function[] }
    private onceCallbacks: { [key: string]: Function[] }
    public hostName: string
    public constructor(app: App) {
        this.app = app
        this.hostName = "statusHost"
        this.onCallbacks = {}
        this.onceCallbacks = {}
    }
    public onGotCmd(cmd: AppIpc.Command) {
        if (cmd.action == "fire") {
            this.fire(cmd.request, cmd.data)
        }
    }

    public fire(event: "session-ready", sender: string): void;
    public fire(event: "session-focus", sender: string): void;
    public fire(event: "session-closed", sender: string): void;
    public fire(event: string, param: any): void;
    public fire(event: string, param: any) {
        if (this.onCallbacks[event]) {
            this.onCallbacks[event].forEach(v => v(param))
        }
        if (this.onceCallbacks[event]) {
            this.onceCallbacks[event].forEach(v => v(param))
            this.onceCallbacks[event] = undefined;
        }
    }

    public on(event: "electron-ready", callback: (launchInfo: LaunchInfo) => void): void;
    public on(event: "electron-window-all-closed", callback: () => void): void;
    public on(event: "electron-activate", callback: () => void): void;
    public on(event: "session-ready", callback: (sender: string) => void): void;
    public on(event: "session-focus", callback: (sender: string) => void): void;
    public on(event: "session-closed", callback: (sender: string) => void): void;
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
    public once(event: "session-ready", callback: (sender: string) => void): void;
    public once(event: "session-focus", callback: (sender: string) => void): void;
    public once(event: "session-closed", callback: (sender: string) => void): void;
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

export class LaunchInfo {
    [key: string]: any
}

