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

/**
 * App Inter-Process-Communication Message Data Structure
 */
export class Message {
    public sender: string = null;
    public receiver: string = null;
    public commands: Command[] = null;
    public channel: string = null;
    public constructor(sender: string, receiver: string, ...commands: Command[]) {
        this.sender = sender
        this.receiver = receiver
        this.commands = commands
        this.channel = `${this.sender}-${this.receiver}`
    }
}