import { Menu, MenuItemConstructorOptions } from "electron";

import * as App from "../App"
import * as AppHost from "../AppHost"
import { Command } from "../AppIpc"

export class MenuHost implements AppHost.IHost {
    public hostName: string = null;

    public onGotCmd(cmd: Command): any {
        if (cmd.action == 'popup') {
            this.cmdArgs = { sess: this.sessCenter.get(cmd.data.sessionName) }
            this.menus[cmd.request].popup()
        }
    };

    private sessCenter: App.SessionCenter
    private cmdArgs: any = null;

    public menuItems: { [name: string]: MenuItemConstructorOptions };
    public menus: { [name: string]: Menu };

    private macMenuHeader: MenuItemConstructorOptions[]

    public constructor(info: App.Info, cmds: App.Commands, sessCenter: App.SessionCenter) {
        this.sessCenter = sessCenter
        this.cmdArgs = {}
        this.macMenuHeader = (info.isMac ? [{
            label: info.appName,
            submenu: [{ role: <'about'>'about' }]
        }] : [])
        const menuItems = {
            close_Or_quit: info.isMac ? { role: <'close'>'close' } : { role: <'quit'>'quit' },
            openAudio: {
                label: "&Open Audio",
                click: () => { cmds.openAudio(this.cmdArgs) }
            },

        }
        this.menus = {
            index: Menu.buildFromTemplate(
                [
                    ... this.macMenuHeader,
                    {
                        label: '&File',
                        submenu: [
                            menuItems.openAudio,
                            menuItems.close_Or_quit
                        ]
                    }
                ]
            )
        }
    }


    private generateMenus(): { [name: string]: Menu } {
        return {
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



}