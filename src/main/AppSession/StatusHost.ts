import { App } from "electron";
import * as AppHost from '../AppHost'
import { IEventHandler, EventEmitter2HandlerWrapper, EventHandler } from "../../shared/EventHandler";
import { Audio } from "../../shared/Audio";

export class StatusHost implements AppHost.IHost {
    public mailBox: AppHost.HostMailbox;
    public constructor() {
        this.mailBox = new AppHost.HostMailbox("statusHost")
        this.mailBox.commandGot.do((sender, cmd) => {
            if (cmd.action == "invoke") {
                const t = this as this & { [key: string]: IEventHandler<any> }
                if (t[cmd.request].invokable) {
                    t[cmd.request].invoke(this, cmd.data)
                }
            } else {
                console.log(`Unknown action [${cmd.action}]`)
            }
        })
        this.audioLoaded = new EventHandler()
    }

    public audioLoaded: IEventHandler<Audio>
}