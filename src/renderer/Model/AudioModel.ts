import { Howl, Howler } from 'howler'
import { Audio, EPlayback, ERandom, ERepeat } from '../AppAudio'
import { IEventHandler, EventHandler } from '../../shared/EventHandler'
import { EAudioModelState } from '../../shared/Audio'

function max(a: number, b: number) { return (a > b) ? a : b }
function min(a: number, b: number) { return (a < b) ? a : b }

export class AudioLoadedEventArgs {
    current: Audio
}
export class AudioEndedEventArgs {
    isManual: boolean
}

export class AudioModel {
    private howl: Howl
    private _current: Audio
    private _playback: EPlayback
    private _repeat: ERepeat
    private _random: ERandom
    private _list: Audio[]
    private _volume: number
    private _lyric: { path: string, data: any }
    private _state: EAudioModelState
    public audioLoaded: IEventHandler<AudioLoadedEventArgs>
    public audioEnded: IEventHandler<AudioEndedEventArgs>
    private analyser: AnalyserNode
    private timeDomainDataBuffer: Float32Array
    private frequencyDataBuffer: Float32Array
    public constructor() {
        this.howl = null;
        this._current = Audio.EMPTY
        this._playback = EPlayback.stopped
        this._repeat = ERepeat.off
        this._random = ERandom.off
        this._list = []
        this._volume = 0.01
        this._lyric = null;
        this.audioLoaded = new EventHandler()
        this.audioEnded = new EventHandler()
    }
    public get timeDomainData() {
        if (!this.analyser) return new Float32Array(2)
        this.analyser.getFloatTimeDomainData(this.timeDomainDataBuffer)
        return this.timeDomainDataBuffer.slice(0)
    }
    public get frequencyData() {
        if (!this.analyser) return new Float32Array(2)
        this.analyser.getFloatFrequencyData(this.frequencyDataBuffer)
        return this.frequencyDataBuffer.slice(0)
    }

    public get state() {
        return this._state
    }

    public set state(value) {
        this._state = value
    }

    public get current() {
        return this._current
    }
    public set current(value) {
        if (this.howl) {
            this.howl.stop()
            this.howl.unload()
            this.howl = null;
        }
        this.state = EAudioModelState.loading
        console.log(value.url)
        this.howl = new Howl({
            src: [value.url],
            volume: this.volume,
            loop: this.repeat == ERepeat.current,
        })
        this.repeat = ERepeat.current
        this.analyser = Howler.ctx.createAnalyser()
        Howler.masterGain.connect(this.analyser);
        this.analyser.connect(Howler.ctx.destination);
        this.analyser.fftSize = 2048;
        const bufferLength = this.analyser.frequencyBinCount;
        this.timeDomainDataBuffer = new Float32Array(bufferLength);
        this.frequencyDataBuffer = new Float32Array(bufferLength);
        this.howl.once('load', () => {
            this.playback = EPlayback.playing
            this._current = value
            if (this.audioLoaded.invokable)
                this.audioLoaded.invoke(this, { current: this.current } as AudioLoadedEventArgs)
            this.state = EAudioModelState.idle
        })
        this.howl.on('end', () => {
            if (!this.repeat) {
                this.playback = EPlayback.stopped;
            }
            if (this.audioLoaded.invokable)
                this.audioEnded.invoke(this, { isManual: false } as AudioEndedEventArgs)
        })

    }

    public get playback() {
        return this._playback;
    }
    public set playback(value) {
        if (!this.howl && this.state==EAudioModelState.loading) return;
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

    public get duration() {
        if (this.howl) return this.howl.duration()
        return 0.001;
    }

    public get repeat() {
        return this._repeat
    }
    public set repeat(value) {
        if (!this.howl) return
        this.howl.loop(value == ERepeat.current)
        this._repeat = value
    }

    public get random() {
        return this._random;
    }
    public set random(value) {
        if (!this.howl) return
        this._random = value
    }

    public get seek() {
        if (this.howl && this.state == EAudioModelState.idle) return <number>this.howl.seek()
        return 0
    }
    public set seek(value) {
        if (!this.howl && this.state == EAudioModelState.loading) return
        if (value >= this.current.duration) {
            value = this.current.duration -= 0.05
        }
        if (value % 1 === 0) value += 0.00001
        this.howl.seek(value);
    }

    public get list() {
        return this._list
    }

    public get volume() {
        if (this.howl && this.state == EAudioModelState.idle) return this.howl.volume();
        return this._volume;
    }
    public set volume(value) {
        let val = max(0, min(1, value))
        this._volume = val;
        if (this.howl && this.state == EAudioModelState.idle ) this.howl.volume(val);
    }

    public get lyric() {
        return this._lyric;
    }
    public set lyric(value) {
        this._lyric = value;
    }

}