import { BrowserWindow, App as ElectronApp, LoadFileOptions, IpcMain } from "electron";

import { MainRouter, Commands, StatusHost as AppStatusHost } from "../App"
import { StatusHost as SessStatusHost } from "../AppSession/StatusHost"

export class Session {
    public name: string = null;
    private appStatusHost: AppStatusHost = null;
    public sessStatusHost: SessStatusHost = null;
    public router: MainRouter = null;
    public rendererWindow: BrowserWindow = null;
    public constructor(
        name: string,
        ipcMain: IpcMain,
        statusHost: AppStatusHost,
        cmds: Commands,
        useDevServer: boolean = false,
        openDevTool: boolean = false
    ) {
        this.name = name;
        this.appStatusHost = statusHost
        this.router = new MainRouter(this.name, ipcMain)
        this.rendererWindow = new BrowserWindow({
            width: 900,
            height: 900,
            minWidth: 800,
            minHeight: 800,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation:false,
                webSecurity: false,
                devTools: openDevTool
            }
        })


        this.router.registerProcess("renderer", this.rendererWindow)

        this.sessStatusHost = new SessStatusHost()
        this.router.registerHost(this.sessStatusHost.mailBox)
        this.sessStatusHost.audioLoaded.do((sender, audio) => {
            cmds.loadLyric({ sess: this, audio: audio })
            /** 跳通知 */
        })

        // and load the index.html of the app.
        if (useDevServer) {
            this.rendererWindow.loadURL(`http://localhost:8080/?name=${name}`)
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
        if (this.appStatusHost.sessionClosed.invokable)
            this.appStatusHost.sessionClosed.invoke(this, this.name)
    }
}