import { AppIpc } from '../shared/Data'
import {IpcRenderer, ipcRenderer} from 'electron'

export type ActionCallback = (req: string, data: any) => void;

export class AppIpcRenderer {
    public ipc: IpcRenderer = null;
    public channel:string = null;
    public getMsgFromCallbacks: {
        [sender: string]: {
            [action: string]: ActionCallback
        }
    } = null;

    public constructor(name:string) {
        this.channel = `${name}-appipc-channel`;
        this.ipc = ipcRenderer
        this.ipc.on(this.channel, (ev, ...arg)=>{
            let msg = <AppIpc.Message>arg[0]
            if (msg.receiver != "renderer") return
            if(!(msg.sender in this.getMsgFromCallbacks)){
                console.log(`No actions for this message: ${msg.channel}.`)
                return
            }
            let actionSet = this.getMsgFromCallbacks[msg.sender]
            console.log(actionSet)
            for (let index = 0; index < msg.commands.length; index++) {
                const cmd = msg.commands[index];
                if(!(cmd.action in actionSet)){
                    console.log(`No action for this command: ${cmd.summary}`)
                }
                actionSet[cmd.action](cmd.request, cmd.data);
            }
        })
        this.getMsgFromCallbacks = {}
        console.log(`Channel ${this.channel} Ipc Constructed`)
    }

    /**
     * Send Message to AppSession
     * @param msg 
     */
    public send(msg: AppIpc.Message) {
        this.ipc.send(this.channel, msg)
    }

    /**
     * Send Message to main process
     * @param msg 
     */
    public static send2main(msg: AppIpc.Message){
        ipcRenderer.send("main-appipc-channel", msg)
    }

    public onGotMessageFrom(sender:string, action:string, callback:ActionCallback) {
        if (!this.getMsgFromCallbacks[sender]) {
            this.getMsgFromCallbacks[sender] = {}
        }
        this.getMsgFromCallbacks[sender][action] = callback;
    }

}