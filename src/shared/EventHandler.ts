import { App } from "electron";

export interface IEventHandler<TEventArgs> {
    do(callback: (sender: any, args: TEventArgs) => void): void
    doOnce(callback: (sender: any, args: TEventArgs) => void): void
    remove(callback: (sender: any, args: TEventArgs) => void): void
    removeAll(): void
    invoke(sender: any, eventArgs: TEventArgs): void
}

export class EventHandler<TEventArgs> implements IEventHandler<TEventArgs>{

    private callbacks: ((sender: any, args: TEventArgs) => void)[];
    private onceCallbacks: ((sender: any, args: TEventArgs) => void)[];
    public constructor() {
        this.callbacks = []
        this.onceCallbacks = []
    }

    public do(callback: (sender: any, args: TEventArgs) => void) {
        this.callbacks.push(callback);
    }

    public doOnce(callback: (sender: any, args: TEventArgs) => void): void {
        this.onceCallbacks.push(callback);
    }

    public remove(callback: (sender: any, args: TEventArgs) => void): void {
        const found = this.callbacks.findIndex((v) => v == callback)
        if (found != -1) {
            this.callbacks.splice(found,1)
        }
        const foundOnce = this.onceCallbacks.findIndex((v) => v == callback)
        if (foundOnce != -1) {
            this.onceCallbacks.splice(foundOnce,1)
        }
    }

    public removeAll(): void {
        this.callbacks = []
    }

    public invoke(sender: any, eventArgs: TEventArgs) {
        this.callbacks.forEach(v => {
            v(sender, eventArgs)
        });
        this.onceCallbacks.forEach(v => {
            v(sender, eventArgs)
        })
        this.onceCallbacks = []
    }
}

export class EventEmitter2HandlerWrapper<TEventArgs> implements IEventHandler<TEventArgs>{
    private emitter: NodeJS.EventEmitter
    private event: string
    public constructor(event: string, emitter: App) {
        this.emitter = emitter
        this.event = event
    }

    public do(callback: (sender: any, args: TEventArgs) => void) {
        this.emitter.on(this.event, callback)
    }

    public doOnce(callback: (sender: any, args: TEventArgs) => void): void {
        this.emitter.once(this.event, callback)
    }

    public invoke(sender: any, eventArgs: TEventArgs) {
        this.emitter.emit(this.event, sender, eventArgs)
    }

    public remove(callback: (sender: any, args: TEventArgs) => void): void {
        this.emitter.removeListener(this.event, callback)
    }
    public removeAll(): void {
        this.emitter.removeAllListeners(this.event)
    }
}
