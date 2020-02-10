import { BrowserWindow, App as ElectronApp, LoadFileOptions, IpcMain } from "electron";

import * as App from "../App"
import * as AppIpc from "../AppIpc";
import * as AppHost from "../AppHost"

export class Session {
    public name: string = null;
    private statusHost: AppHost.StatusHost = null;
    public router: AppIpc.MainRouter = null;
    public rendererWindow: BrowserWindow = null;
    public constructor(
        name: string,
        ipcMain: IpcMain,
        statusHost: AppHost.StatusHost,
        useDevServer: boolean = false,
        openDevTool: boolean = false
    ) {
        this.name = name;
        this.statusHost = statusHost
        this.router = new AppIpc.MainRouter(this.name, ipcMain)
        this.rendererWindow = new BrowserWindow({
            width: 900,
            height: 900,
            minWidth: 800,
            minHeight: 600,
            webPreferences: {
                nodeIntegration: true,
                webSecurity: false,
                devTools: !openDevTool
            }
        })
        

        this.router.registerProcess("renderer", this.rendererWindow)
        // and load the index.html of the app.
        if (useDevServer) {
            this.rendererWindow.loadURL(`http://localhost:8080/index.html?name=${name}`)
        } else {
            this.rendererWindow.loadFile(`www/index.html`,
                <LoadFileOptions>{
                    search: `?name=${name}`
                })
        }

        // Open the DevTools.
        this.rendererWindow.webContents.openDevTools({
            mode: "detach"
        })

        // 視窗關閉時會觸發。
        this.rendererWindow.on('closed', () => {
            this.close()
        })
    }

    /**
     * Close Session 
     */
    public close() {
        this.router.close()
        this.router = null;
        this.rendererWindow = null;
        this.statusHost.fire("session-closed", this.name)
    }
}