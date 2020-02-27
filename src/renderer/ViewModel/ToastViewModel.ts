import { IHost, HostMailbox } from "../AppHost"
import { BaseViewModel } from "./BaseViewModel";
import { Toast } from "../../shared/Toast"
import { IdPool } from "../../shared/IdPool";

export class ToastViewModel extends BaseViewModel implements IHost {
    public mailBox: HostMailbox;
    private idPool: IdPool
    public constructor() {
        super()
        this.idPool = new IdPool()
        this.mailBox = new HostMailbox("toast")
        this.mailBox.commandGot.do((sender, args) => {
            if (args.action == "drop") {
                this.dropToast(args.data)
            }
            if (args.action == "cancel") {
                this.cancelToast(args.data)
            }
        })
        this.mailBox.commandGotSync.do((sender, args) => {
            if (args.command.action == "drop") {
                args.return = this.dropToast(args.command.data)
            }
        })
        this._showingToasts = {}
        this.timeouts = {}
    }
    public dropToast(toast: Toast) {
        toast.id = this.idPool.genId()
        const enterTimeout = setTimeout(() => {
            this._showingToasts[toast.id] = toast
            this.notifyPropChange("showingToasts")
        }, toast.delay)
        let leaveTimeout: NodeJS.Timeout
        if (toast.duration > 0) {
            leaveTimeout = setTimeout(() => {
                delete this._showingToasts[toast.id]
                this.idPool.disposeId(toast.id)
                this.notifyPropChange("showingToasts")
            }, toast.delay + toast.duration)
        }
        this.timeouts[toast.id] = [enterTimeout, leaveTimeout]
        return toast.id
    }
    public cancelToast(id: number) {
        clearTimeout(this.timeouts[id][0])
        clearTimeout(this.timeouts[id][1])
        delete this._showingToasts[id]
        delete this.timeouts[id]
        this.idPool.disposeId(id)
        this.notifyPropChange("showingToasts")
    }
    public _showingToasts: { [id: number]: Toast }
    private timeouts: { [id: number]: [NodeJS.Timeout, NodeJS.Timeout] }
    public get showingToasts() {
        return Object.values(this._showingToasts)
    }
}


