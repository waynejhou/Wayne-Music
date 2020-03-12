// import from npm module
import { app, App, ipcMain, Menu, BrowserWindow } from 'electron'
import * as os from 'os'
import * as path from 'path'


// import from src
import * as commandLineArgs from 'command-line-args'
import { optionDefinitions, Option, MainRouter, Info, StatusHost, Commands, MenuHost } from './App'
import { SessionCenter } from './AppSession'


const argv = process.argv
if (app.isPackaged) argv.splice(1, 0, " ")
const option = commandLineArgs(optionDefinitions, { argv: argv }) as Option

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
    app.quit()
    process.exit(0)
}
else {
    // Global 介面擴充，以參照重要物件
    type IExGlobal = NodeJS.Global & {
        mainRouter: MainRouter,
        info: Info,
        statusHost: StatusHost,
        sessionCenter: SessionCenter,
        commands: Commands
        menuHost: MenuHost,
        option: Option
    }

    // cast global to interface inorder to save references
    const g = <IExGlobal>global

    g.option = option

    g.mainRouter = new MainRouter("main", ipcMain)

    g.info = new Info(app)

    g.statusHost = new StatusHost(app)

    g.mainRouter.registerHost(g.statusHost.mailBox)

    g.sessionCenter = new SessionCenter(ipcMain, g.statusHost);

    g.commands = new Commands(g.info, g.sessionCenter)

    g.menuHost = new MenuHost(g.info, g.commands, g.sessionCenter)

    g.mainRouter.registerHost(g.menuHost.mailBox)

    Menu.setApplicationMenu(g.menuHost.menus.index)

    g.statusHost.electronReady.do(
        (sender, launchInfo) => {
            if (g.option.useDevServer) {
                const react_dev_tool_path = path.join(os.homedir(), "AppData/Local", "Google/Chrome/User Data/Profile 1/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.4.0_0")
                BrowserWindow.addDevToolsExtension(react_dev_tool_path)
            }
            g.sessionCenter.createSession(g.commands, g.option, g.info)
        })

    g.statusHost.electronActivate.do(
        (sender, [event, hasVisibleWindows]) => {
            g.sessionCenter.createSession(g.commands, g.option, g.info)
        })

    g.statusHost.electronWindowAllClosed.do(
        (sender) => {
            app.quit()
        })

    g.statusHost.sessionReady.doOnce(
        (sender) => {
            const paths = g.option.audioFiles
            if (paths && paths.length > 0) {
                g.commands.openAudioByPaths({ paths: paths, sess: null })
            }
            /*g.commands.openAudioByPaths({
                paths:[
                    "D:\\D.flac",
                    "D:\\audio.flac",
                ], sess:null})*/
        })

    g.statusHost.electronSecondInstance.do(
        (sender, [event, argv, workingDirectory]) => {
            if (app.isPackaged) {
                argv.splice(0, 3)
            }
            else {
                argv.splice(0, 4)
            }
            const option = commandLineArgs(optionDefinitions, { argv: argv }) as Option
            const paths = option.audioFiles
            if (paths && paths.length > 0) {
                g.commands.openAudioByPaths({ paths: paths, sess: null })
            }
        })
}

console.log("main.ts completed")