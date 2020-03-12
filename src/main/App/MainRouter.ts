import { BrowserWindow, IpcMain, IpcMainEvent, App } from "electron";
import { HostMailbox, Message } from "../../shared/AppIpc";
import { Command, ReturnableCommand } from "../../shared/AppIpc/Message";

export type ActionCallback = (req: string, data: any) => void;

export class MainRouter {
    private name: string;
    private hostMailBoxs: { [key: string]: HostMailbox };
    private processes: { [key: string]: BrowserWindow };
    protected channel: string;
    protected syncSendChannel: string
    protected syncReturnChannel: string
    protected ipc: IpcMain

    public constructor(name: string, ipc: IpcMain) {
        this.name = name
        this.channel = `${name}-appipc-channel`
        this.syncSendChannel = `${name}-appipc-sync-send-channel`
        this.syncReturnChannel = `${name}-appipc-sync-return-channel`
        this.hostMailBoxs = {}
        this.processes = {};
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
            this.sendReturn(msg.senderProcess, new Message(msg.receiverHost, msg.senderHost,
                ...ret
            ))
        })
    }

    public send(processName: string, msg: Message) {
        msg.senderProcess = "main"
        msg.receiverProcess = processName
        this.processes[processName].webContents.send(this.channel, msg)
    }
    public sendReturn(processName: string, msg: Message) {
        msg.senderProcess = "main"
        msg.receiverProcess = processName
        this.processes[processName].webContents.send(this.syncReturnChannel, msg)
    }
    public sendSync(processName: string, msg: Message) {
        return new Promise<Command[]>((resolve, reject) => {
            msg.senderProcess = "main"
            msg.receiverProcess = processName
            this.processes[processName].webContents.send(this.syncSendChannel, msg)
            this.ipc.once(this.syncReturnChannel, (ev, ...args) => {
                resolve((args[0] as Message).commands)
            })
        })
    }
    public registerProcess(key: string, window: BrowserWindow) {
        this.processes[key] = window
    }
    public registerHost(mailBox: HostMailbox) {
        this.hostMailBoxs[mailBox.hostName] = mailBox
    }

    public close() {
        this.hostMailBoxs = null
        this.ipc.removeAllListeners(this.channel)
    }
}