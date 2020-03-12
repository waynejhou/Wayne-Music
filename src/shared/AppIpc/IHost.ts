import * as AppIpc from "./Message";
import { HostMailbox } from "./HostMailbox";

/*
export interface IHost {
    hostName: string
    onGotCmd: (msg: AppIpc.Command) => void
}*/
export interface IHost {
    mailBox: HostMailbox
}