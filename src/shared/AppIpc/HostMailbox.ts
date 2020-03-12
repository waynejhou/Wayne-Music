import { Message, Command, ReturnableMessage, ReturnableCommand } from "./Message";
import { EventHandler, IEventHandler } from "../EventHandler";

export class HostMailbox {
    public hostName: string;
    public messageGot: IEventHandler<Message>;
    public commandGot: IEventHandler<Command>;
    public commandGotSync: IEventHandler<ReturnableCommand>;
    public constructor(name: string) {
        this.hostName = name
        this.messageGot = new EventHandler()
        this.commandGot = new EventHandler()
        this.commandGotSync = new EventHandler()
    }
}