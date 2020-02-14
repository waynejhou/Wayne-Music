import { IpcMain } from "electron";

import * as App from "../App"
import * as AppHost from "../AppHost"

export class SessionCenter {
    private sessSet: { [name: string]: App.Session }
    private lastFocusSessName: string
    private info: App.Info;
    private statusHost: AppHost.StatusHost
    private ipcMain: IpcMain
    private cliArgs: App.CommandLineArgs
    public constructor(ipcMain: IpcMain, info: App.Info, cliArgs: App.CommandLineArgs, statusHost: AppHost.StatusHost) {
        this.lastFocusSessName = null;
        this.sessSet = {};
        this.info = info
        this.statusHost = statusHost
        this.ipcMain = ipcMain
        this.cliArgs = cliArgs
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

    public createSession() {
        const sessName = `session_${this.length}`
        const sess = new App.Session(
            sessName,
            this.ipcMain,
            this.statusHost,
            this.cliArgs.args.useDevServer,
            !this.info.isPackaged)
        this.sessSet[sessName] = sess
        this.changeLastFocus(sessName)
    }
}