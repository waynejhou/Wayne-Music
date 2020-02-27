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
                    if (t[cmd.request].invokable)
                        t[cmd.request].invoke(this, cmd.data)
                }
            } else {
                console.log(`Unknown action [${cmd.action}]`)
            }
        })
        this.electronReady = new EventEmitter2HandlerWrapper("ready", this.app)
        this.electronWindowAllClosed = new EventEmitter2HandlerWrapper("window-all-closed", this.app)
        this.electronActivate = new EventEmitter2HandlerWrapper("activate", this.app)
        this.electronSecondInstance = new EventEmitter2HandlerWrapper("second-instance", this.app)
        this.sessionReady = new EventHandler()
        this.sessionFoces = new EventHandler()
        this.sessionClosed = new EventHandler()
    }
    /** launchInfo: unknown */
    public electronReady: IEventHandler<unknown>
    /** void */
    public electronWindowAllClosed: IEventHandler<void>
    /** event: Electron.Event, hasVisibleWindows: boolean */
    public electronActivate: IEventHandler<[Electron.Event, boolean]>
    /** event: Electron.Event, argv: string[], workingDirectory: string */
    public electronSecondInstance: IEventHandler<[Electron.Event, string[], string]>
    public sessionReady: IEventHandler<string>
    public sessionFoces: IEventHandler<string>
    public sessionClosed: IEventHandler<string>
}

