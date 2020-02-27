import { BaseViewModel } from './BaseViewModel'
import { IHost, HostMailbox } from '../AppHost'
import { Audio } from '../AppAudio'


export class ListViewModel extends BaseViewModel implements IHost {
    public mailBox: HostMailbox
    public _current: Audio[]
    public constructor() {
        super()
        this._current = []
        this.mailBox = new HostMailbox("list")
        this.mailBox.commandGot.do((sender, cmd) => {
            if (cmd.action == "add") {
                this.current.push(cmd.data)
                this.notifyPropChange("current")
            }
        })
    }
    public get current() {
        return this._current
    }
}