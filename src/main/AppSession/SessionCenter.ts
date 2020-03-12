import { IpcMain } from "electron";
import { Session } from "./Session";
import { Info, StatusHost, Commands, Option } from "../App";

export class SessionCenter {
    private sessSet: { [name: string]: Session }
    private lastFocusSessName: string
    private info: Info;
    private statusHost: StatusHost
    private ipcMain: IpcMain
    public constructor(ipcMain: IpcMain, statusHost: StatusHost) {
        this.lastFocusSessName = null;
        this.sessSet = {};
        this.statusHost = statusHost
        this.ipcMain = ipcMain
        this.statusHost.sessionFoces.do((sender, sessionName) => {
            this.changeLastFocus(sessionName)
        })
        this.statusHost.sessionClosed.do((sender, sessionName) => {
            delete this.sessSet[sessionName]
        })
    }

    public changeLastFocus(name: string) {
        if (name in this.sessSet) {
            this.lastFocusSessName = name
        }
    }

    public get(name: string) {
        return this.sessSet[name]
    }

    public get length() {
        return Object.keys(this.sessSet).length
    }

    public get lastFocusSess() {
        if (this.lastFocusSessName) {
            return this.sessSet[this.lastFocusSessName]
        }
        return null;
    }

    public createSession(cmds:Commands, option:Option, info:Info) {
        const sessName = `session_${this.length}`
        const sess = new Session(
            sessName,
            this.ipcMain,
            this.statusHost,
            cmds,
            option.useDevServer,
            !info.isPackaged)
        this.sessSet[sessName] = sess
        this.changeLastFocus(sessName)
    }
}