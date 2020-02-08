import { Session } from '../AppSession'
import * as AppIpc from '../AppIpc'
import { IHost } from '../AppHost';
import { cast2ExGlobal } from '../IExGlobal'

const g = cast2ExGlobal(global)


export class SessionHost implements IHost{
    public hostName: string;
    public onGotMsg: (msg: AppIpc.Message)=>void
    private sessSet: {[name:string]:Session}
    private lastFocusSessName: string

    public constructor(){
        this.hostName = 'sessCenter'
        this.lastFocusSessName = null;
        this.sessSet = {};
        g.stateCenter.on("session-focus", (sender)=>{
            this.changeLastFocus(sender)
        })
    }

    public add(sess:Session){
        this.sessSet[sess.name] = sess
        this.changeLastFocus(sess.name)
    }
    public remove(name:string){
        delete this.sessSet[name]
    }
    public changeLastFocus(name:string){
        if(name in this.sessSet){
            this.lastFocusSessName = name
        }
    }

    public get(name:string){
        return this.sessSet[name]
    }

    public get length(){
        return Object.keys(this.sessSet).length
    }

    public get lastFocusSess(){
        if(this.lastFocusSessName){
            return this.sessSet[this.lastFocusSessName]
        }
        return null;
    }

}