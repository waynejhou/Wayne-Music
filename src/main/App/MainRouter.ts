import { BrowserWindow, IpcMain, IpcMainEvent, App } from "electron";
import * as AppIpc from "../AppIpc"

export type ActionCallback = (req: string, data: any) => void;

export class MainRouter extends AppIpc.AppIpcRouter<IpcMain>{
    public constructor(name: string, ipc: IpcMain) {
        super(name, ipc)
        this.processes = {};
    }
    private processes: { [key: string]: BrowserWindow };
    public send(processName: string, msg: AppIpc.Message) {
        this.processes[processName].webContents.send(this.channel, msg)
    }
    public registerProcess(key: string, window: BrowserWindow) {
        this.processes[key] = window
    }
}