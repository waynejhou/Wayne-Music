import { IpcRenderer, ipcRenderer } from 'electron'
import { Message, HostMailbox, Command, ReturnableCommand } from '../../shared/AppIpc';

export type ActionCallback = (req: string, data: any) => void;

export class RendererRouter {
    private name: string;
    private hostMailBoxs: { [key: string]: HostMailbox };
    protected channel: string;
    protected syncSendChannel: string
    protected syncReturnChannel: string
    protected ipc: IpcRenderer
    public constructor(name: string, ipc: IpcRenderer) {
        this.name = name
        this.channel = `${name}-appipc-channel`
        this.syncSendChannel = `${name}-appipc-sync-send-channel`
        this.syncReturnChannel = `${name}-appipc-sync-return-channel`
        this.hostMailBoxs = {}
        this.ipc = ipc
        ipc.on(this.channel, (ev: Event, ...args: any[]) => {
            let msg = <Message>args[0]
            if (!(msg.receiverHost in this.hostMailBoxs)) {
                console.log(`${this.name} had no host for this channel: ${msg.channel}`)
                return
            }
            if (this.hostMailBoxs[msg.receiverHost].messageGot.invokable)
                this.hostMailBoxs[msg.receiverHost].messageGot.invoke(this, msg)
            for (let index = 0; index < msg.commands.length; index++) {
                const cmd = msg.commands[index];
                if (this.hostMailBoxs[msg.receiverHost].commandGot.invokable)
                    this.hostMailBoxs[msg.receiverHost].commandGot.invoke(this, cmd)
            }
        })
        ipc.on(this.syncSendChannel, (ev: Event, ...args: any[]) => {
            let msg = <Message>args[0]
            if (!(msg.receiverHost in this.hostMailBoxs)) {
                console.log(`${this.name} had no host for this channel: ${msg.channel}`)
                return
            }
            const ret = msg.commands.map(cmd => {
                const retCmd = cmd as ReturnableCommand
                if (this.hostMailBoxs[msg.receiverHost].commandGotSync.invokable)
                    this.hostMailBoxs[msg.receiverHost].commandGotSync.invoke(this, retCmd)
                return new Command("sync", "return", retCmd.return)
            })
            this.sendReturn(new Message(msg.receiverHost, msg.senderHost,
                ...ret
            ))
        })
    }

    public send(msg: Message) {
        msg.senderProcess = "renderer"
        msg.receiverProcess = "main"
        this.ipc.send(this.channel, msg)
    }
    public sendReturn(msg: Message) {
        msg.senderProcess = "renderer"
        msg.receiverProcess = "main"
        this.ipc.send(this.syncReturnChannel, msg)
    }
    public sendSync(processName: string, msg: Message) {
        return new Promise<Command[]>((resolve, reject) => {
            msg.senderProcess = "main"
            msg.receiverProcess = processName
            this.ipc.send(this.syncSendChannel, msg)
            this.ipc.once(this.syncReturnChannel, (ev, ...args) => {
                resolve((args[0] as Message).commands)
            })
        })
    }

    public registerHost(mailBox: HostMailbox) {
        this.hostMailBoxs[mailBox.hostName] = mailBox
    }

    public close() {
        this.hostMailBoxs = null
        this.ipc.removeAllListeners(this.channel)
    }

    public static send2main(msg: Message) {
        ipcRenderer.send("main-appipc-channel", msg)
    }
}
