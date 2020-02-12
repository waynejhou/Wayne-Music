import { App } from "electron";
import * as AppHost from '../AppHost'
import { IEventHandler, EventEmitter2HandlerWrapper, EventHandler } from "../../shared/EventHandler";

export class StatusHost implements AppHost.IHost {
    private app: App;
    public mailBox: AppHost.HostMailbox
    public constructor(app: App) {
        this.app = app
        this.mailBox = new AppHost.HostMailbox("statusHost")
        this.mailBox.commandGot.do((sender, cmd) => {
            if (cmd.action == "invoke") {
                const t = this as this & { [key: string]: IEventHandler<any> }
                if (t[cmd.request]) {
                    t[cmd.request].invoke(this, cmd.data)
                }
            }else{
                console.log(`Unknown action [${cmd.action}]`)
            }
        })
        this.electronReady = new EventEmitter2HandlerWrapper("ready", this.app)
        this.electronWindowAllClosed = new EventEmitter2HandlerWrapper("window-all-closed", this.app)
        this.electronActivate = new EventEmitter2HandlerWrapper("activate", this.app)
        this.sessionReady = new EventHandler()
        this.sessionFoces = new EventHandler()
        this.sessionClosed = new EventHandler()
    }

    public electronReady: IEventHandler<unknown>
    public electronWindowAllClosed: IEventHandler<void>
    public electronActivate: IEventHandler<void>
    public sessionReady: IEventHandler<string>
    public sessionFoces: IEventHandler<string>
    public sessionClosed: IEventHandler<string>
}

