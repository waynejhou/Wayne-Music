import { Message, Command } from "./AppIpcMessage";
import { EventHandler, IEventHandler } from "./EventHandler";

export class HostMailbox {
    public hostName: string;
    public messageGot: IEventHandler<Message>;
    public commandGot: IEventHandler<Command>;
    public constructor(name:string){
        this.hostName = name
        this.messageGot = new EventHandler()
        this.commandGot = new EventHandler()
    }
}