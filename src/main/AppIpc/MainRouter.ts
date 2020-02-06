import { BrowserWindow, IpcMain, IpcMainEvent } from "electron";
import { IHost } from "../AppHost";
import * as AppIpc from "../AppIpc"

export type ActionCallback = (req: string, data: any) => void;

export class MainRouter {
    private hosts: { [key: string]: IHost };
    private processes: { [key: string]: BrowserWindow };
    private channel: string;
    private ipcMain: IpcMain;
    private name: string;
    private getMsgFromCallbacks: {
        [sender: string]: {
            [action: string]: ActionCallback
        }
    } = {};

    public constructor(name: string, ipcMain: IpcMain) {
        this.ipcMain = ipcMain
        this.name = name
        this.channel = `${name}-appipc-channel`
        this.hosts = {}
        this.processes = {};
        this.ipcMain.on(this.channel, (ev: IpcMainEvent, ...arg: any)=>{
            let msg = <AppIpc.Message>arg[0]
            if (!(msg.receiver in this.hosts)) {
                console.log(`${this.name} had no host for this channel: ${msg.channel}`)
                return
            }
            this.hosts[msg.receiver].onGotMsg(msg);
        })
        console.log(`Channel ${this.channel} Ipc Constructed`)
    }

    public send(msg: AppIpc.Message) {
        this.processes[msg.receiver].webContents.send(this.channel, msg)
    }

    public registerHost(host: IHost) {
        this.hosts[host.hostName] = host
    }

    public registerProcess(key: string, window: BrowserWindow) {
        this.processes[key] = window
    }

    public close(){
        this.name = null
        this.channel = null
        this.hosts = null
        this.processes = null
        this.ipcMain.removeAllListeners(this.channel)
        this.ipcMain = null;
    }
}