import { IpcRenderer, IpcRendererEvent, ipcRenderer } from 'electron'
import * as AppHost from '../AppHost'
import { Message } from '../../shared/AppIpcMessage';
import { AppIpcRouter } from '../../shared/AppIpcRouter';

export type ActionCallback = (req: string, data: any) => void;

export class RendererRouter extends AppIpcRouter<IpcRenderer>{

    public send(msg: Message) {
        super.ipc.send(this.channel, msg)
    }


    public static send2main(msg: Message){
        ipcRenderer.send("main-appipc-channel", msg)
    }
}
