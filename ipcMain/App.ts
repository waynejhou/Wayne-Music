import { app, BrowserWindow, Menu, MenuItemConstructorOptions } from 'electron';

import viewExpress from './viewExpress';
import { Server as WebSocketServer } from 'ws'
import { Server as HttpServer } from 'http'
import { AppIPCMain } from './AppIPCMain'
import { AppMenuGenerator } from './AppMenuGenerator'
import { AppCommandsGenerator } from './AppCommandsGenerator'

interface Global extends NodeJS.Global {
    viewServer: HttpServer,
    nativeWin: BrowserWindow,
    audioBgWin: BrowserWindow,
    wsServer: WebSocketServer,
    ipcMg: AppIPCMain,
    appCmdGen: AppCommandsGenerator,
    appMenuGen: AppMenuGenerator
}
function GetGlobal(): Global { return <Global>global }
var g = GetGlobal();
(<Global>global).viewServer = null;
(<Global>global).nativeWin = null;
(<Global>global).audioBgWin = null;
(<Global>global).wsServer = null;
(<Global>global).ipcMg = null;
(<Global>global).appCmdGen = null;
(<Global>global).appMenuGen = null;

const VIEW_PORT = 8888;
const viewApp = viewExpress.getPresetExpressApp(app.getAppPath())

function createWindow() {
    g.viewServer = viewApp.listen(VIEW_PORT, () => {
        console.log(`View Server running at http://127.0.0.1:${VIEW_PORT}/`);
    })
    g.wsServer = new WebSocketServer({ server: g.viewServer })

    // 建立 Audio Background Worker (一個不會顯示的瀏覽器視窗)。
    g.audioBgWin = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
        }
    })

    g.ipcMg = new AppIPCMain(g.audioBgWin, g.wsServer);



    // bgWorker 讀取頁面
    g.audioBgWin.loadURL(`http://loGcalhost:${VIEW_PORT}/audio`)
    // bgWorker 開啟獨立(因為沒有視窗依附)開發視窗
    g.audioBgWin.webContents.openDevTools({
        mode: "detach"
    })

    // 建立瀏覽器視窗。
    g.nativeWin = new BrowserWindow({
        width: 900,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })
    g.appCmdGen = new AppCommandsGenerator(app, g.nativeWin, g.ipcMg);

    // and load the index.html of the app.
    g.nativeWin.loadURL(`http://localhost:${VIEW_PORT}`)

    // Open the DevTools.
    g.nativeWin.webContents.openDevTools()

    // 視窗關閉時會觸發。
    g.nativeWin.on('closed', () => {
        // 拿掉 window 物件的參照。如果你的應用程式支援多個視窗，
        // 你可能會將它們存成陣列，現在該是時候清除相關的物件了。
        g.nativeWin = null;
        g.ipcMg = null;
        g.appMenuGen = null;
        g.appCmdGen = null;
        g.audioBgWin.destroy();
        g.audioBgWin = null;
        g.viewServer.close(() => {
            console.log("View Server closed.")
        });
        g.viewServer = null;
        g.wsServer.close(() => {
            console.log("View Server closed.")
        });
        g.wsServer = null;
    })
    g.appMenuGen = new AppMenuGenerator(app, g.appCmdGen)
    let template: MenuItemConstructorOptions[] = g.appMenuGen.MenuTemplate

    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}


// 當 Electron 完成初始化，並且準備好建立瀏覽器視窗時
// 會呼叫這的方法
// 有些 API 只能在這個事件發生後才能用。
app.on('ready', createWindow)

// 在所有視窗都關閉時結束程式。
app.on('window-all-closed', () => {
    // 在 macOS 中，一般會讓應用程式及選單列繼續留著，
    // 除非使用者按了 Cmd + Q 確定終止它們
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // 在 macOS 中，一般會在使用者按了 Dock 圖示
    // 且沒有其他視窗開啟的情況下，
    // 重新在應用程式裡建立視窗。
    if (g.nativeWin === null) {
        createWindow()
    }
})


// 你可以在這個檔案中繼續寫應用程式主程序要執行的程式碼。 
// 你也可以將它們放在別的檔案裡，再由這裡 require 進來。

