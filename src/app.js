const { app, BrowserWindow, dialog, Menu, globalShortcut } = require('electron')
const mm = require('music-metadata');
const url = require('url');

const view = require('./viewServer')
const base64 = require('./base64')
ipcChannels = require('./electron-channel-names')



view.init(app)
port = 8888
view.start(port)


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
global.win=null
global.bgWorker=null
const isMac = process.platform === 'darwin'

function newFileFilter(name, exts) {
    return {
        name: name,
        extensions: exts
    }
}

function createWindow() {
    // 建立 Background Worker (一個不會顯示的瀏覽器視窗)。
    bgWorker = new BrowserWindow({
        show:false,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            devTools: false,
        }
    })
    bgWorker.on('read-to-show',()=>{
        console.log('bgWorker on read-to-show')
    })
    // bgWorker 讀取頁面
    bgWorker.loadURL(`http://localhost:${port}/audio`)
    // bgWorker 開啟獨立(因為沒有視窗依附)開發視窗
    //bgWorker.webContents.openDevTools({
        //mode : "detach"
    //})


    // 建立瀏覽器視窗。
    win = new BrowserWindow({
        width: 900,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            devTools: false,
        }
    })

    /*
    globalShortcut.register('CommandOrControl+R', function() {
        console.log('CommandOrControl+R is pressed')
        win.reload()
        win.webContents.openDevTools()
    })*/

    // and load the index.html of the app.
    win.loadURL(`http://localhost:${port}`)

    // Open the DevTools.
    //win.webContents.openDevTools()

    // 視窗關閉時會觸發。
    win.on('closed', () => {
        // 拿掉 window 物件的參照。如果你的應用程式支援多個視窗，
        // 你可能會將它們存成陣列，現在該是時候清除相關的物件了。
        win = null;
        bgWorker.destroy()
        bgWorker = null;
    })

    let template = [
        ...(isMac ? [{
            label: app.name,
            submenu: [
                { role: 'about' }
            ]
        }] : []),
        {
            label: '&File',
            submenu: [
                
                {
                    label: '&Open File',
                    click: () => {
                        dialog.showOpenDialog(win, {
                            filters: [newFileFilter('Audio', ['flac', 'mp3'])],
                            title: "Open Audio"
                        }).then((result) => {
                            if (result.length <= 0) return;
                            mm.parseFile(result.filePaths[0], { skipPostHeaders: true })
                                .then(metadata => {
                                    let audio_data = ((metadata, fileName) => {
                                        let data = metadata.common;
                                        data.url = url.pathToFileURL(fileName).href;
                                        data.duration = metadata.format.duration;
                                        if (!data.artist) data.artist = "Unknown Artist"
                                        if (!data.title) data.title = path.basename(data.fileName)
                                        if (!data.album) data.album = "Unknown Album"
                                        if (data.picture.length > 0) {
                                            data.picture = `data:${data.picture[0].format};base64,${base64.bytesToBase64(data.picture[0].data)}`
                                        } else data.picture = "img/Ellipses.png";
                                        return data;
                                    })(metadata, result.filePaths[0]);
                                    console.log(
                                        `[ipcMain send {audio_data: "${audio_data.url}"}`+
                                        " to {bgWorker}"+
                                        " on channel: {ipcChannels.audio_change_src}]")
                                    bgWorker.webContents.send(ipcChannels.audio_change_src, audio_data)
                                })
                                .catch((err) => {
                                    console.error(err.message);
                                });
                        })
                    }
                },
                isMac ? { role: 'close' } : { role: 'quit' }
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
        view.stop()
        app.quit()
    }
})

app.on('activate', () => {
    // 在 macOS 中，一般會在使用者按了 Dock 圖示
    // 且沒有其他視窗開啟的情況下，
    // 重新在應用程式裡建立視窗。
    if (win === null) {
        createWindow()
    }
})


// 你可以在這個檔案中繼續寫應用程式主程序要執行的程式碼。 
// 你也可以將它們放在別的檔案裡，再由這裡 require 進來。