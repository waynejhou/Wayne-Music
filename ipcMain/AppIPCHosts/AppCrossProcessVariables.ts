import { AppIPCMain, AppIPCMessage } from "../AppIPCMain";
import { Menu } from "electron";
import { IAppIPCHost } from "./IAppIPCHost";

export class AppCrossProcessVariables implements IAppIPCHost {
    public HostName: string = "CrossProcessVariables";

    public Variables: { [name: string]: any } = {};
    private _ipcMg: AppIPCMain = null;

    public constructor(ipcMg: AppIPCMain) {
        this._ipcMg = ipcMg
    }

    public OnGotMsg(msg: AppIPCMessage): any {
        console.log(`${msg.Channel}`)
        //if (typeof this.Variables[msg.Request] === undefined) return;
        if (msg.Action == 'Set') {
            this.Variables[msg.Request] = msg.Data
        }
        if (msg.Action == 'Get') {
            let res = new AppIPCMessage(this.HostName, "Renderer", "Get", msg.Request)
            res.Data = this.Variables[msg.Request];
            this._ipcMg.Send(res)
        }
    };

}