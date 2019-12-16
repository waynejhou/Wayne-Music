import { App, MenuItemConstructorOptions } from "electron";
import { AppCommandsGenerator } from './AppCommandsGenerator'

export class AppMenuGenerator {
    private _app: App = null;
    private _cmds: AppCommandsGenerator = null;
    public constructor(app: App, cmds: AppCommandsGenerator) {
        this._app = app;
        this._cmds = cmds
    }
    private _isMac: boolean = process.platform === 'darwin'
    private get MacMenuHeaderTemplate(): MenuItemConstructorOptions[] {
        return (this._isMac ? [{
            label: this._app.name,
            submenu: [{ role: <'about'>'about' }]
        }] : [])
    }
    private get CloseOrQuit(): MenuItemConstructorOptions {
        return this._isMac ? { role: <'close'>'close' } : { role: <'quit'>'quit' }
    }

    public get MenuTemplate(): MenuItemConstructorOptions[] {
        return [
            ... this.MacMenuHeaderTemplate,
            {
                label: '&File',
                submenu: [
                    {
                        label: "&Open Audio",
                        click: () => { this._cmds.OpenDialog_Load_Play() }
                    },
                    this.CloseOrQuit
                ]
            },
        ]
    }
}
