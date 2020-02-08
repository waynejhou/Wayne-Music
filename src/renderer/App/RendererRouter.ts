import { ipcRenderer, IpcRendererEvent } from 'electron'
import * as AppHost from '../AppHost'
import { Message } from '../AppIpc';

export type ActionCallback = (req: string, data: any) => void;

export class RendererRouter{
    private hosts: { [key: string]: AppHost.IHost };
    private channel: string;
    private name: string;
    private getMsgFromCallbacks: {
        [sender: string]: {
            [action: string]: ActionCallback
        }
    } = {};

    public constructor(name: string) {
        this.name = name
        this.channel = `${name}-appipc-channel`
        this.hosts = {}
        ipcRenderer.on(this.channel, (ev: IpcRendererEvent, ...arg: any) => {
            let msg = <Message>arg[0]
            if (!(msg.receiver in this.hosts)) {
                console.log(`${this.name} had no host for this channel: ${msg.channel}`)
                return
            }
            for (let index = 0; index < msg.commands.length; index++) {
                const cmd = msg.commands[index];
                this.hosts[msg.receiver].onGotCmd(cmd);
            }
        })
        console.log(`Channel ${this.channel} Ipc Constructed`)
    }

    public send(msg: Message) {
        ipcRenderer.send(this.channel, msg)
    }

    public registerHost(host: AppHost.IHost) {
        this.hosts[host.hostName] = host
    }

    public close() {
        this.hosts = null
        ipcRenderer.removeAllListeners(this.channel)
    }

    public static send2main(msg: Message){
        ipcRenderer.send("main-appipc-channel", msg)
    }
}
