import { App } from "electron";
import { IdPool } from "./IdPool";

export interface IEventHandler<TEventArgs> {
    do(callback: (sender: any, args: TEventArgs) => void): void
    doOnce(callback: (sender: any, args: TEventArgs) => void): void
    remove(callback: (sender: any, args: TEventArgs) => void): void
    removeAll(): void
    invokable: boolean
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
            this.callbacks.splice(found, 1)
        }
        const foundOnce = this.onceCallbacks.findIndex((v) => v == callback)
        if (foundOnce != -1) {
            this.onceCallbacks.splice(foundOnce, 1)
        }
    }

    public get invokable(): boolean {
        return (this.callbacks.length + this.onceCallbacks.length) > 0
    }

    public removeAll(): void {
        this.callbacks = []
    }

    public invoke(sender: any, eventArgs: TEventArgs) {
        if (!this.invokable) throw new Error("This handle is not handle any things.")
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
    private callbackMap: { [id: number]: [(sender: any, args: TEventArgs) => void, (...args: any[]) => void] }
    private idPool: IdPool
    public constructor(event: string, emitter: App) {
        this.emitter = emitter
        this.event = event
        this.callbackMap = {}
        this.idPool = new IdPool()
    }
    public do(callback: (sender: any, args: TEventArgs) => void) {
        const id = this.idPool.genId()
        this.callbackMap[id] = [null, null]
        this.callbackMap[id][0] = callback
        this.callbackMap[id][1] = (...args) => {
            callback(this.emitter, args as unknown as TEventArgs)
        }
        this.emitter.on(this.event, this.callbackMap[id][1])
    }

    public doOnce(callback: (sender: any, args: TEventArgs) => void): void {
        const id = this.idPool.genId()
        this.callbackMap[id] = [null, null]
        this.callbackMap[id][0] = callback
        this.callbackMap[id][1] = (...args) => {
            callback(this.emitter, args as unknown as TEventArgs)
            delete this.callbackMap[id]
            this.idPool.disposeId(id)
        }
        this.emitter.once(this.event, callback)
    }

    public get invokable(): boolean {
        return this.emitter.listenerCount(this.event) > 0
    }


    public invoke(sender: any, eventArgs: TEventArgs) {
        this.emitter.emit(this.event, sender, eventArgs)
    }

    public remove(callback: (sender: any, args: TEventArgs) => void): void {
        Object.keys(this.callbackMap).forEach(idx=>{
            const id = idx as unknown as number
            if(this.callbackMap[id][0]==callback){
                this.emitter.removeListener(this.event, this.callbackMap[id][1])
                delete this.callbackMap[id]
                this.idPool.disposeId(id)
            }
        })
        
    }
    public removeAll(): void {
        this.emitter.removeAllListeners(this.event)
        this.callbackMap = {}
        this.idPool.dispose()
    }
}
