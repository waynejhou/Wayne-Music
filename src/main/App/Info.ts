import { App as ElectronApp } from "electron"
import * as path from 'path'

export class Info {
    public appName: string
    public isMac: boolean
    public exePath: string
    public isPackaged: boolean
    public constructor(app: ElectronApp) {
        this.appName = app.name
        this.isMac = process.platform === "darwin"
        this.isPackaged = app.isPackaged
        this.exePath = app.isPackaged ? path.dirname(app.getPath('exe')) : app.getAppPath();
    }
}