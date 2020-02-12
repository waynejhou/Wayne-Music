import * as AppIpc from "./AppIpcMessage";
import { HostMailbox } from "./HostMailbox";

/*
export interface IHost {
    hostName: string
    onGotCmd: (msg: AppIpc.Command) => void
}*/
export interface IHost {
    mailBox: HostMailbox
}