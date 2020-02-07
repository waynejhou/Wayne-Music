import { Menu, App, MenuItemConstructorOptions } from "electron";
import { Session } from '../AppSession'
import * as AppIpc from '../AppIpc'
import { IHost, CommandCenter } from '../AppHost';
import { cast2ExGlobal } from "../IExGlobal";

const g = cast2ExGlobal(global);

export class MenuHost implements IHost {
    public hostName: string = null;
    private app: App = null;
    private cmds: CommandCenter = null;
    private cmdArgs: any = null;
    public menus: { [name: string]: Menu } = null;
    private static isMac: boolean = process.platform === 'darwin'
    private get macMenuHeaderTemplate(): MenuItemConstructorOptions[] {
        return (MenuCenter.isMac ? [{
            label: this.app.name,
            submenu: [{ role: <'about'>'about' }]
        }] : [])
    }

    private get closeOrQuit(): MenuItemConstructorOptions {
        return MenuCenter.isMac ? { role: <'close'>'close' } : { role: <'quit'>'quit' }
    }

    public constructor(app: App, cmds: CommandCenter) {
        this.app = app;
        this.cmds = cmds;
        this.menus = this.generateMenus()
    }

    private generateMenus(): { [name: string]: Menu } {
        return {
            index: Menu.buildFromTemplate(
                [
                    ... this.macMenuHeaderTemplate,
                    {
                        label: '&File',
                        submenu: [
                            {
                                label: "&Open Audio",
                                click: () => { this.cmds.openAudioDialog_loadAudio_SendAudio_Play(this.cmdArgs) }
                            },
                            this.closeOrQuit
                        ]
                    },
                ]
            ),
            /*list: Menu.buildFromTemplate([
                {
                    label: "Remove &Selected Item",
                    click: () => { this.cmds.RemoveAudioInCurrentListByIdxs(this.cmdArgs) }
                },
                {
                    label: "Remove &All Item",
                    click: () => { this.cmds.RemoveAllAudioInCurrentList(this.cmdArgs) }
                }
            ]),
            lyric: Menu.buildFromTemplate([
                {
                    label: "&Open LRC file External",
                    click: () => { this.cmds.OpenLRCFileAtExternal(this.cmdArgs) }
                },
                {
                    label: "&Reload LRC file",
                    click: () => { this.cmds.ReloadLRCFile(this.cmdArgs) }
                }
            ])*/
        }
    }

    public onGotMsg(msg: AppIpc.Message): any {
        for (let index = 0; index < msg.commands.length; index++) {
            const cmd = msg.commands[index];
            if (cmd.action == 'popup') {
                this.cmdArgs = {sess: g.sessCenter.get(cmd.data.sessionName)}
                this.menus[cmd.request].popup()
            }
        }
    };


}