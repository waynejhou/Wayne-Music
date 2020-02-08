// import from npm module
import { app, ipcMain, Menu } from 'electron'

// import from src
import * as AppIpc from "./AppIpc"
import * as App from "./App"
import * as AppHost from "./AppHost"

// Global 介面擴充，以參照重要物件
type IExGlobal = NodeJS.Global & {
    mainRouter: AppIpc.MainRouter,
    info: App.Info,
    statusHost: AppHost.StatusHost,
    commandLineArgs: App.CommandLineArgs,
    sessionCenter: App.SessionCenter,
    commands: App.Commands
    menuHost: AppHost.MenuHost
}

// cast global to interface inorder to save references
const g = <IExGlobal>global

g.mainRouter = new AppIpc.MainRouter("main", ipcMain)

g.info = new App.Info(app)

g.statusHost = new AppHost.StatusHost(app)

g.mainRouter.registerHost(g.statusHost)

g.commandLineArgs = new App.CommandLineArgs(g.statusHost)

g.sessionCenter = new App.SessionCenter(ipcMain, g.info, g.commandLineArgs, g.statusHost);

g.commands = new App.Commands(g.info, g.sessionCenter)

g.menuHost = new AppHost.MenuHost(g.info, g.commands, g.sessionCenter)
g.mainRouter.registerHost(g.menuHost)

Menu.setApplicationMenu(g.menuHost.menus.index)

g.statusHost.on("electron-ready", (info) => {
    g.sessionCenter.createSession()
})

g.statusHost.on('electron-activate', () => {
    g.sessionCenter.createSession()
})

g.statusHost.on('electron-window-all-closed', () => {
    app.quit()
})

g.statusHost.once('session-ready', () => {
    const paths = g.commandLineArgs.args.audioFiles
    if (paths && paths.length > 0) {
        g.commands.openAudioByPaths({ paths })
    }
})
