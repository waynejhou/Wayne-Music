import { IpcMainEvent, IpcRendererEvent, IpcMain, IpcRenderer, Event } from "electron";
import { HostMailbox } from "./HostMailbox";
import { Message } from "./AppIpcMessage";



export class AppIpcRouter<TIpc extends IpcMain | IpcRenderer> {

    public constructor(name: string, ipc: TIpc) {
        this.name = name
        this.channel = `${name}-appipc-channel`
        this.hostMailBoxs = {}
        this.ipc = ipc
        ipc.on(this.channel, (ev: Event, ...args: any[]) => {
            let msg = <Message>args[0]
            if (!(msg.receiver in this.hostMailBoxs)) {
                console.log(`${this.name} had no host for this channel: ${msg.channel}`)
                return
            }
            this.hostMailBoxs[msg.receiver].messageGot.invoke(this, msg)
            for (let index = 0; index < msg.commands.length; index++) {
                const cmd = msg.commands[index];
                this.hostMailBoxs[msg.receiver].commandGot.invoke(this, cmd)
            }
        })
        console.log(`Channel ${this.channel} Ipc Constructed`)
    }
    private name: string;
    protected channel: string;
    private hostMailBoxs: { [key: string]: HostMailbox };


    public registerHost(mailBox: HostMailbox) {
        this.hostMailBoxs[mailBox.hostName] = mailBox
    }

    protected ipc: TIpc
    public close() {
        this.hostMailBoxs = null
        this.ipc.removeAllListeners(this.channel)
    }
}