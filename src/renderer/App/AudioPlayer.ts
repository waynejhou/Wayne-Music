import { Howl } from 'howler'
import { Audio, EPlayback, ERandom, ERepeat } from '../AppAudio'

import * as AppHost from "../AppHost"
import { Command } from '../AppIpc'

function max(a: number, b: number) { return (a > b) ? a : b }
function min(a: number, b: number) { return (a < b) ? a : b }

export class AudioPlayer implements AppHost.IHost {
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
        this._volume = 0.5
        this._lyric = null;
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
        })
        this.howl.on('end', () => {
            if (!this.repeat) {
                this.playback = EPlayback.stopped;
            }
        })
        this._current = value
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
    }

    get repeat() {
        return this._repeat
    }
    set repeat(value) {
        if (!this.howl) return
        this.howl.loop(value == ERepeat.current)
        this._repeat = value
    }

    get random() {
        return this._random;
    }
    set random(value) {
        if (!this.howl) return
        this._random = value
    }

    get seek(){
        if(this.howl) return <number>this.howl.seek()
        return 0
    }
    set seek(value){
        if (!this.howl) return
        if (value >= this.current.duration) {
            value = this.current.duration -= 0.05
        }
        if(value % 1 === 0) value+=0.00001
        this.howl.seek(value);
    }

    get list(){
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
    }

    get lyric() {
        return this._lyric;
    }
    set lyric(value) {
        this._lyric = value;
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
}