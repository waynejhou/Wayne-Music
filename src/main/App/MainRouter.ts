import { BrowserWindow, IpcMain, IpcMainEvent } from "electron";
import { IHost } from "../AppHost";
import { Message } from "../AppIpc"

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
        this.ipcMain.on(this.channel, (ev: IpcMainEvent, ...arg: any) => {
            let msg = <Message>arg[0]
            if (!(msg.receiver in this.hosts)) {
                console.log(`${this.name} had no host for this channel: ${msg.channel}`)
                return
            }
            for (let index = 0; index < msg.commands.length; index++) {
                const cmd = msg.commands[index];
                this.hosts[msg.receiver].onGotCmd(cmd);
            }
            
        })
        console.log(`Channel ${this.channel} Ipc Constructed`)
    }

    public send(processName: string, msg: Message) {
        this.processes[processName].webContents.send(this.channel, msg)
    }

    public registerHost(host: IHost) {
        this.hosts[host.hostName] = host
    }

    public registerProcess(key: string, window: BrowserWindow) {
        this.processes[key] = window
    }

    public close() {
        this.hosts = null
        this.processes = null
        this.ipcMain.removeAllListeners(this.channel)
        this.ipcMain = null;
    }
}

