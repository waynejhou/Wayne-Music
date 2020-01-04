import { AppIPCMain, AppIPCMessage } from "../AppIPCMain";
import { Menu, App, MenuItemConstructorOptions } from "electron";
import { IAppIPCHost } from "./IAppIPCHost";
import { AppCommandCenter } from "./AppCommandCenter";

export class AppMenuCenter implements IAppIPCHost {
    HostName: string = "MenuCenter";
    private _app: App = null;
    private _cmds: AppCommandCenter = null;
    private _cmdArgs:any = null;
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
                            click: () => { this._cmds.OpenDialog_Load_Play(this._cmdArgs) }
                        },
                        this.CloseOrQuit
                    ]
                },
            ]
        ),
        List: Menu.buildFromTemplate([
            {
                label: "Remove &Selected Item",
                click: () => { this._cmds.RemoveAudioInCurrentListByIdxs(this._cmdArgs) }
            },
            {
                label: "Remove &All Item",
                click: () => { this._cmds.RemoveAllAudioInCurrentList(this._cmdArgs) }
            }
        ])
    };

    public OnGotMsg(msg: AppIPCMessage): any {
        if (typeof this.Menus[msg.Request] === undefined) return;
        this._cmdArgs = msg.Data
        if (msg.Action == 'Popup') {
            this.Menus[msg.Request].popup()
        }
    };


}