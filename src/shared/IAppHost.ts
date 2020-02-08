import * as AppIpc from "./AppIpcMessage";

export interface IHost {
    hostName: string
    onGotCmd: (msg: AppIpc.Command) => void
}