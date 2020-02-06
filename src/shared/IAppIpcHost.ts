import { AppIpc } from "./Data";

export interface IHost {
    hostName: string
    onGotMsg: (msg: AppIpc.Message) => void
}