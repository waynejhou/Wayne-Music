import { AudioModel, Audio, EPlayback, ERandom, ERepeat } from '../AppAudio'
import { BaseViewModel } from './BaseViewModel'
import { IHost, HostMailbox } from '../AppHost'

export class AudioViewModel extends BaseViewModel implements IHost {
    mailBox: HostMailbox
    private audio: AudioModel
    public constructor(audio: AudioModel) {
        super()
        this.audio = audio
        audio.audioLoaded.do((sender, ev) => {
            this.notifyPropChange("title");
            this.notifyPropChange("album");
            this.notifyPropChange("playback");
            this.notifyPropChange("duration");
            this.notifyPropChange("picture");
            function monitorSeekChange(seekingAudio: Audio, vm: AudioViewModel) {
                if (vm.audio.playback == EPlayback.playing) {
                    vm.notifyPropChange("seek");
                    vm.notifyPropChange("timeDomainData");
                    vm.notifyPropChange("frequencyData");
                }
                if (seekingAudio == vm.current) {
                    setTimeout(monitorSeekChange, 33, seekingAudio, vm)
                }
            }
            setTimeout(monitorSeekChange, 33, ev.current, this)
        })
        audio.audioEnded.do((sender, ev) => {
            this.notifyPropChange("playback");
        })
        this.mailBox = new HostMailbox("audio")
        this.mailBox.commandGot.do((sender, cmd) => {
            console.log(cmd)
            switch (cmd.action) {
                case 'update':
                    this[cmd.request] = cmd.data
                    break;
                default:
                    console.log(`Unrecognized Action [${cmd.action}]`)
                    break;
            }
        })
        this.timeDomainDataHistory = new Array()
        this.frequencyDataHistory = new Array()
    }

    private timeDomainDataHistory: Array<Float32Array>
    public get timeDomainData() {
        const length = 32
        const historyMax = 5
        const data = this.audio.timeDomainData
        let ret = new Float32Array(length).fill(0)
        const step = data.length / length
        for (let i = 0; i < length; i++) {
            for (let j = i * step; j < (i + 1) * step; j++) {
                ret[i] += data[j]
            }
            ret[i] /= step
        }

        if(historyMax>1){
            if (this.timeDomainDataHistory.length > historyMax) {
                this.timeDomainDataHistory.shift()
            }
            this.timeDomainDataHistory.push(ret)
            ret = new Float32Array(length).fill(0)
            for (let i = 0; i < length; i++) {
                for (let j = 0; j < this.timeDomainDataHistory.length; j++) {
                    ret[i] += this.timeDomainDataHistory[j][i]
                }
                ret[i] /= this.timeDomainDataHistory.length
            }
        }
        ret = ret.map(v => Math.round(v * 500))
        return ret
    }

    private frequencyDataHistory: Array<Float32Array>
    public get frequencyData() {
        const length = 32
        const historyMax = 1
        const data = this.audio.frequencyData
        let ret = new Float32Array(length).fill(0)
        const step = data.length / length
        for (let i = 0; i < ret.length; i++) {
            for (let j = i * step; j < (i + 1) * step; j++) {
                ret[i] += data[j]
            }
            ret[i] /= step
        }

        if(historyMax>1){
            if (this.frequencyDataHistory.length > historyMax) {
                this.frequencyDataHistory.shift()
            }
            this.frequencyDataHistory.push(ret)
            ret = new Float32Array(length).fill(0)
            for (let i = 0; i < length; i++) {
                for (let j = 0; j < this.frequencyDataHistory.length; j++) {
                    ret[i] += this.frequencyDataHistory[j][i]
                }
                ret[i] /= this.frequencyDataHistory.length
                
            }
        }
        ret = ret.map(v => Math.round(-v)-150)
        return ret
    }

    public get current() {
        return this.audio.current;
    }
    public set current(value) {
        this.audio.current = value
    }

    public get duration() {
        return this.audio.duration;
    }


    public get title() {
        if (this.audio.current.title)
            return this.audio.current.title
        return "Unknow Title"
    }
    public get album() {
        if (this.audio.current.album)
            return this.audio.current.album
        return "Unknow aAbum"
    }

    public get playback() {
        if (this.audio.playback == EPlayback.paused)
            return "play_arrow"
        if (this.audio.playback == EPlayback.playing)
            return "pause"
        if (this.audio.playback == EPlayback.stopped)
            return "play_arrow"
    }
    public ctrlPlayPause() {
        if (this.audio.playback == EPlayback.paused) {
            this.audio.playback = EPlayback.playing
        }
        else if (this.audio.playback == EPlayback.stopped) {
            this.audio.playback = EPlayback.playing
        }
        else if (this.audio.playback == EPlayback.playing) {
            this.audio.playback = EPlayback.paused
        }
        this.notifyPropChange("playback")
    }

    public get volume() {
        return this.audio.volume
    }
    public set volume(value) {
        this.audio.volume = value
        this.notifyPropChange("volume")
    }
    public incVolume() {
        this.volume += 0.05
    }
    public decVolume() {
        this.volume -= 0.05
    }

    public get seek() {
        return this.audio.seek
    }
    public set seek(value) {
        this.audio.seek = value
    }

    public get picture() {
        return this.audio.current.picture
    }
}