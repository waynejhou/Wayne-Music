// import from npm module
import { app, ipcMain, Menu, BrowserWindow } from 'electron'
import * as os from 'os'
import * as path from 'path'

// import from src
import * as AppIpc from "./AppIpc"
import * as App from "./App"
import * as AppHost from "./AppHost"



// Global 介面擴充，以參照重要物件
type IExGlobal = NodeJS.Global & {
    mainRouter: App.MainRouter,
    info: App.Info,
    statusHost: AppHost.StatusHost,
    commandLineArgs: App.CommandLineArgs,
    sessionCenter: App.SessionCenter,
    commands: App.Commands
    menuHost: AppHost.MenuHost
}

// cast global to interface inorder to save references
const g = <IExGlobal>global

g.mainRouter = new App.MainRouter("main", ipcMain)

g.info = new App.Info(app)

g.statusHost = new AppHost.StatusHost(app)

g.mainRouter.registerHost(g.statusHost.mailBox)

g.commandLineArgs = new App.CommandLineArgs(g.statusHost)

g.sessionCenter = new App.SessionCenter(ipcMain, g.info, g.commandLineArgs, g.statusHost);

g.commands = new App.Commands(g.info, g.sessionCenter)

g.menuHost = new AppHost.MenuHost(g.info, g.commands, g.sessionCenter)
g.mainRouter.registerHost(g.menuHost.mailBox)

Menu.setApplicationMenu(g.menuHost.menus.index)

g.statusHost.electronReady.do((sender, info) => {
    if (g.commandLineArgs.args.useDevServer) {
        const react_dev_tool_path = path.join(os.homedir(), "AppData/Local", "Google/Chrome/User Data/Profile 1/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.4.0_0")
        BrowserWindow.addDevToolsExtension(react_dev_tool_path)
    }
    g.sessionCenter.createSession()
})

g.statusHost.electronActivate.do((sender) => {
    g.sessionCenter.createSession()
})

g.statusHost.electronWindowAllClosed.do((sender) => {
    app.quit()
})

g.statusHost.sessionReady.doOnce((sender) => {
    const paths = g.commandLineArgs.args.audioFiles
    if (paths && paths.length > 0) {
        g.commands.openAudioByPaths({ paths })
    }
})

console.log("main.ts completed")