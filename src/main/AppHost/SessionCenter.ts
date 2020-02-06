import { Session } from '../AppSession'
import * as AppIpc from '../AppIpc'
import { IHost } from '../AppHost';

export class SessionCenter implements IHost{
    public hostName: string;
    public onGotMsg(msg: AppIpc.Message){
        console.log(`${this.hostName} got msg on ${msg.channel}`)
        if(msg.receiver!=this.hostName) return;
        for (let index = 0; index < msg.commands.length; index++) {
            const cmd = msg.commands[index];
            if(cmd.action=="focus"){
                this.changeLastFocus(cmd.request)
            }
        }
    };
    private sessSet: {[name:string]:Session}
    private lastFocusSessName: string

    public constructor(){
        this.hostName = 'sessCenter'
        this.lastFocusSessName = null;
        this.sessSet = {};
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