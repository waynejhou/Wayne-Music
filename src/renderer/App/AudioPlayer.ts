import { Howl } from 'howler'
import { Audio, EPlayback, ERandom, ERepeat } from '../AppAudio'

import * as AppHost from "../AppHost"
import { Command } from '../AppIpc'
import { IActionRequestEmitter } from '../IEventEmitter'

function max(a: number, b: number) { return (a > b) ? a : b }
function min(a: number, b: number) { return (a < b) ? a : b }

export class AudioPlayer implements AppHost.IHost, IActionRequestEmitter {
    public hostName: string
    private howl: Howl
    private _current: Audio
    private _playback: EPlayback
    private _repeat: ERepeat
    private _random: ERandom
    private _list: Audio[]
    private _volume: number
    private _lyric: { path: string, data: any }
    public constructor() {
        this.hostName = "audio"
        this.howl = null;
        this._current = Audio.empty
        this._playback = EPlayback.stopped
        this._repeat = ERepeat.off
        this._random = ERandom.off
        this._list = []
        this._volume = 0.01
        this._lyric = null;
        this.onCallbacks = {}
        this.onceCallbacks = {}
    }
    get current() {
        return this._current
    }
    set current(value) {
        if (this.howl) {
            this.howl.unload()
            this.howl = null;
        }
        this.howl = new Howl({
            src: [value.url],
            volume: this.volume,
            loop: this.repeat == ERepeat.current
        })
        this.howl.once('load', () => {
            this.playback = EPlayback.playing
            this._current = value
            this.fire("updated", "current", this.current)
        })
        this.howl.on('end', () => {
            if (!this.repeat) {
                this.playback = EPlayback.stopped;
            }
        })
    }

    get playback() {
        return this._playback;
    }
    set playback(value) {
        if (!this.howl) return;
        if (!(value in EPlayback)) return;
        if (value == EPlayback.playing) {
            this.howl.play()
        }
        if (value == EPlayback.paused) {
            this.howl.pause()
        }
        if (value == EPlayback.stopped) {
            this.howl.stop()
        }
        this._playback = value;
        this.fire("updated", "playback", this.playback)
    }

    get repeat() {
        return this._repeat
    }
    set repeat(value) {
        if (!this.howl) return
        this.howl.loop(value == ERepeat.current)
        this._repeat = value
        this.fire("updated", "repeat", this.repeat)
    }

    get random() {
        return this._random;
    }
    set random(value) {
        if (!this.howl) return
        this._random = value
        this.fire("updated", "random", this.random)
    }

    get seek() {
        if (this.howl) return <number>this.howl.seek()
        return 0
    }
    set seek(value) {
        if (!this.howl) return
        if (value >= this.current.duration) {
            value = this.current.duration -= 0.05
        }
        if (value % 1 === 0) value += 0.00001
        this.howl.seek(value);
        this.fire("updated", "seek", this.seek)
    }

    get list() {
        return this._list
    }

    get volume() {
        if (this.howl) return this.howl.volume();
        return this._volume;
    }
    set volume(value) {
        let val = max(0, min(1, value))
        this._volume = val;
        if (this.howl) this.howl.volume(val);
        this.fire("updated", "volume", this.volume)
    }

    get lyric() {
        return this._lyric;
    }
    set lyric(value) {
        this._lyric = value;
        this.fire("updated", "lyric", this.lyric)
    }

    public onGotCmd(cmd: Command) {
        switch (cmd.action) {
            case 'update':
                this[cmd.request] = cmd.data
                break;
            default:
                console.log(`Unrecognized Action [${cmd.action}]`)
                break;
        }
    }

    public onCallbacks: {
        [action: string]: {
            [request: string]: {
                [id: number]: (data: any) => void
            }
        }
    }
    public onceCallbacks: {
        [action: string]: {
            [request: string]: {
                [id: number]: (data: any) => void
            }
        }
    }
    private fire(action: string, request: string, data: any) {
        console.log(`fire ${action} ${request} ${data}`)
        if (this.onceCallbacks[action] && this.onceCallbacks[action][request]) {
            Object.values(this.onceCallbacks[action][request]).forEach(v => v(data))
            this.onceCallbacks[action][request] = {}
        }
        if (this.onCallbacks[action] && this.onCallbacks[action][request]) {
            Object.values(this.onCallbacks[action][request]).forEach(v => v(data))
        }
    }

    private idleIdPool = []
    private usingIdPool = []
    private getId() {
        if (this.idleIdPool.length > 0) {
            const ret = this.idleIdPool[0]
            this.idleIdPool.splice(0,1)
            this.usingIdPool.push(ret)
            return ret
        }
        const ret = this.idleIdPool.length + this.usingIdPool.length
        this.usingIdPool.push(ret)
        return ret
    }
    private removeId(id: number) {
        const found = this.usingIdPool.findIndex((v)=>v==id)
        if(found!=-1){
            this.idleIdPool.push(
                this.usingIdPool[found]
            )
            this.usingIdPool.splice(found,1)
        }
    }

    public on(action: string, request: string, callback: (data: any) => void) {
        if (!this.onCallbacks[action]) {
            this.onCallbacks[action] = {}
        }
        if (!this.onCallbacks[action][request]) {
            this.onCallbacks[action][request] = {}
        }
        const id = this.getId()
        this.onCallbacks[action][request][id] = callback
        return id
    }

    public once(action: string, request: string, callback: (data: any) => void) {
        if (!this.onceCallbacks[action]) {
            this.onceCallbacks[action] = {}
        }
        if (!this.onceCallbacks[action][request]) {
            this.onceCallbacks[action][request] = []
        }
        const id = this.getId()
        this.onceCallbacks[action][request][id] = callback
        return id
    }

    public removeAll(action: string, request: string) {
        if (this.onCallbacks[action] && this.onCallbacks[action][request]) {
            this.onCallbacks[action][request] = {}
        }
        if (this.onceCallbacks[action] && this.onceCallbacks[action][request]) {
            this.onceCallbacks[action][request] = {}
        }
    }

    public remove(action: string, request: string, id: number) {
        if (this.onCallbacks[action] && this.onCallbacks[action][request]) {
            delete this.onCallbacks[action][request][id]
            this.removeId(id)
        }
        if (this.onceCallbacks[action] && this.onceCallbacks[action][request]) {
            delete this.onceCallbacks[action][request][id]
            this.removeId(id)
        }
    }
}