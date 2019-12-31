import { AppIPCMain, AppIPCMessage } from "../AppIPCMain";
import { Menu, App, MenuItemConstructorOptions } from "electron";
import { IAppIPCHost } from "./IAppIPCHost";
import { AppCommandCenter } from "./AppCommandCenter";

export class AppMenuCenter implements IAppIPCHost {
    HostName: string = "MenuCenter";
    private _app: App = null;
    private _cmds: AppCommandCenter = null;

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

    public constructor(app: App, cmds: AppCommandCenter) {
        this._app = app;
        this._cmds = cmds
    }

    public Menus: { [name: string]: Menu } = {
        Index: Menu.buildFromTemplate(
            [
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
        ),
        List: Menu.buildFromTemplate([
            {
                label: "&Open Audio",
                click: () => { this._cmds.OpenDialog_Load_Play() }
            }
        ])
    };

    public OnGotMsg(msg: AppIPCMessage): any {
        if (typeof this.Menus[msg.Request] === undefined) return;
        if (msg.Action == 'Popup') {
            this.Menus[msg.Request].popup()
        }
    };


}