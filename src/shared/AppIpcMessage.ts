

/**
 * App Inter-Process-Communication Command Data Structure
 */
export class Command {
    public action: string = null;
    public request: string = null;
    public data: any = null;
    public summary: string = null;
    public constructor(action: string, request: string, data: any = null) {
        this.action = action
        this.request = request
        this.data = data
        this.summary = `{${this.action}:${this.request}}`
    }
}

export class ReturnableCommand {
    public command: Command
    public return: any
    public constructor(command: Command) {
        this.command = command
    }
}

/**
 * App Inter-Process-Communication Message Data Structure
 */
export class Message {
    public senderHost: string = null;
    public receiverHost: string = null;
    public senderProcess: string = null;
    public receiverProcess: string = null;
    public commands: Command[] = null;
    public channel: string = null;
    public constructor(sender: string, receiver: string, ...commands: Command[]) {
        this.senderHost = sender
        this.receiverHost = receiver
        this.commands = commands
        this.channel = `${this.senderHost}-${this.receiverHost}`
    }
}

export class ReturnableMessage {
    public message: Message
    public return: any
    public constructor(message: Message) {
        this.message = message
    }
}
