import { AppIPCMessage, AppIPCMain } from "../AppIPCMain";

export interface IAppIPCHost {
    HostName: string
    OnGotMsg: (msg: AppIPCMessage) => void
}