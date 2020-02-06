import { BrowserWindow, App, LoadFileOptions, IpcMain } from "electron";
import * as AppIpc from "./AppIpc";
import * as AppHost from "./AppHost";
import { cast2ExGlobal } from "./IExGlobal";

const g = cast2ExGlobal(global);

export class Session {
    public rendererWindow: BrowserWindow = null;
    public router: AppIpc.MainRouter = null;
    public name:string = null;
    public menuCenter: AppHost.MenuCenter = null;
    public cmdCenter: AppHost.CommandCenter = null;
    public constructor(name:string, app:App, ipcMain:IpcMain, useDevServer: boolean = false) {
        this.name = name;
        this.rendererWindow = new BrowserWindow({
            width: 900,
            height: 900,
            minWidth: 800,
            minHeight: 600,
            webPreferences: {
                nodeIntegration: true,
                devTools: !app.isPackaged
            }
        })

        this.router = new AppIpc.MainRouter(this.name, ipcMain)
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
        g.sessCenter.remove(this.name)
        this.cmdCenter = null;
        this.menuCenter = null;
        this.router.close()
        this.router = null;
        this.name = null;
        this.rendererWindow.destroy()
        delete this.rendererWindow
        this.rendererWindow = null;
    }
}