import { Menu, MenuItemConstructorOptions } from "electron";
import { IHost, HostMailbox } from "../../shared/AppIpc";
import { SessionCenter } from "../AppSession";
import { Info } from "./Info";
import { Commands } from "./Commands";


export class MenuHost implements IHost {
    public mailBox: HostMailbox;
    public hostName: string = null;

    private sessCenter: SessionCenter
    private cmdArgs: any = null;

    public menuItems: { [name: string]: MenuItemConstructorOptions };
    public menus: { [name: string]: Menu };

    private macMenuHeader: MenuItemConstructorOptions[]

    public constructor(info: Info, cmds: Commands, sessCenter: SessionCenter) {
        this.mailBox = new HostMailbox("menuHost")
        this.mailBox.commandGot.do((cmd) => {
            if (cmd.action == 'popup') {
                this.cmdArgs = { sess: this.sessCenter.get(cmd.data.sessionName) }
                this.menus[cmd.request].popup()
            }
        })
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
            hideWindow:{
                label: "&Hide Window",
                click: () => { this.sessCenter.lastFocusSess.rendererWindow.hide() }
            }

        }
        this.menus = {
            index: Menu.buildFromTemplate(
                [
                    ... this.macMenuHeader,
                    {
                        label: '&File',
                        submenu: [
                            menuItems.openAudio,
                            menuItems.close_Or_quit,
                            menuItems.hideWindow
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