import { app, BrowserWindow, dialog, Menu, FileFilter, MenuItemConstructorOptions, ipcMain } from 'electron';

import * as mm from 'music-metadata'
import viewExpress from './viewExpress';
import { IpcChannels } from './IpcChannels';
import { AudioData } from './AudioData'
import { Server as WebSocketServer } from 'ws'

interface Global extends NodeJS.Global {
    mainWin: BrowserWindow,
    bgWorker: BrowserWindow,
    wsServer: WebSocketServer
}
function GetGlobal(): Global { return <Global>global }
var g = GetGlobal();
(<Global>global).mainWin = null;
(<Global>global).bgWorker = null;
(<Global>global).wsServer = null;


const VIEW_PORT = 8888;
const WS_PORT = 8889;
const viewApp = viewExpress.getPresetExpressApp(app.getAppPath())
const viewServer = viewApp.listen(VIEW_PORT, () => {
    console.log(`View Server running at http://127.0.0.1:${VIEW_PORT}/`);
})
g.wsServer = new WebSocketServer({ server: viewServer })
g.wsServer.on("connection", (socket, request) => {
    console.log('Client connected')
    socket.on("message", (data) => {
        g.bgWorker.webContents.send(IpcChannels.wss_message_incoming, JSON.parse(<string>data))
    })
    socket.on('close', () => {
        console.log('Close connected')
    })
})



const isMac = process.platform === 'darwin'

function newFileFilter(name: string, exts: string[]): FileFilter {
    return {
        name: name,
        extensions: exts
    }
}

function createWindow() {
    // 建立 Background Worker (一個不會顯示的瀏覽器視窗)。
    g.bgWorker = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
        }
    })

    // bgWorker 讀取頁面
    g.bgWorker.loadURL(`http://localhost:${VIEW_PORT}/audio`)
    // bgWorker 開啟獨立(因為沒有視窗依附)開發視窗
    g.bgWorker.webContents.openDevTools({
        mode: "detach"
    })


    // 建立瀏覽器視窗。
    g.mainWin = new BrowserWindow({
        width: 900,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            //webSecurity: false,
            //devTools: false,
        }
    })

    /*
    globalShortcut.register('CommandOrControl+R', function() {
        console.log('CommandOrControl+R is pressed')
        win.reload()
        win.webContents.openDevTools()
    })*/

    // and load the index.html of the app.
    g.mainWin.loadURL(`http://localhost:${VIEW_PORT}`)

    // Open the DevTools.
    g.mainWin.webContents.openDevTools()

    // 視窗關閉時會觸發。
    g.mainWin.on('closed', () => {
        // 拿掉 window 物件的參照。如果你的應用程式支援多個視窗，
        // 你可能會將它們存成陣列，現在該是時候清除相關的物件了。
        g.mainWin = null;
        g.wsServer.close();
        g.wsServer = null;
        g.bgWorker.destroy()
        g.bgWorker = null;
    })
    let template: MenuItemConstructorOptions[] = [
        ...(
            isMac ? [
                {
                    label: app.name,
                    submenu: [
                        { role: <'about'>'about' }
                    ]
                }
            ] : []),
        {
            label: '&File',
            submenu: [
                {
                    label: '&Open File',
                    click: () => {
                        dialog.showOpenDialog(g.mainWin, {
                            filters: [newFileFilter('Audio', ['flac', 'mp3']),],
                            title: "Open Audio",
                            properties: ["multiSelections"],
                        }).then((result: { canceled: boolean, filePaths: string[] }) => {
                            if (result.canceled) return;
                            mm.parseFile(result.filePaths[0], { skipPostHeaders: true })
                                .then((metadata: mm.IAudioMetadata) => {
                                    let data = new AudioData(result.filePaths[0], metadata);
                                    console.log("" + data)
                                    console.log(
                                        `[ipcMain send {audio_data: "${data.url}"}` +
                                        " to {bgWorker}" +
                                        " on channel: {ipcChannels.audio_change_src}]")
                                    g.bgWorker.webContents.send(IpcChannels.audio_change_src, data)
                                })
                                .catch((err) => {
                                    console.error(err.message);
                                });
                            result.filePaths.forEach((path, idx) => {
                                if (idx == 0) return;
                                mm.parseFile(result.filePaths[idx], { skipPostHeaders: true })
                                    .then((metadata: mm.IAudioMetadata) => {
                                        let data = new AudioData(result.filePaths[idx], metadata);
                                        console.log("" + data)
                                        console.log(
                                            `[ipcMain send {audio_data: "${data.url}"}` +
                                            " to {bgWorker}" +
                                            " on channel: {ipcChannels.audio_add_src}]")
                                        g.bgWorker.webContents.send(IpcChannels.audio_add_src, data)
                                    })
                                    .catch((err) => {
                                        console.error(err.message);
                                    });
                            });
                        })
                    }
                },
                isMac ? { role: <'close'>'close' } : { role: <'quit'>'quit' }
            ]
        }
    ]

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
        viewServer.close(() => {
            console.log(`view server closed`);
        })
        app.quit()
    }
})

app.on('activate', () => {
    // 在 macOS 中，一般會在使用者按了 Dock 圖示
    // 且沒有其他視窗開啟的情況下，
    // 重新在應用程式裡建立視窗。
    if (g.mainWin === null) {
        createWindow()
    }
})


// 你可以在這個檔案中繼續寫應用程式主程序要執行的程式碼。 
// 你也可以將它們放在別的檔案裡，再由這裡 require 進來。

