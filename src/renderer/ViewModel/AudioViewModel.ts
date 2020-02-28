import { AudioModel, Audio, EPlayback, ERandom, ERepeat } from '../AppAudio'
import { BaseViewModel } from './BaseViewModel'
import { IHost, HostMailbox } from '../AppHost'
import * as ArrayEx from '../Utils/ArrayEx'
import { RendererRouter } from '../Utils/RendererRouter'
import { Message, Command } from '../../shared/AppIpcMessage'
import { ToastViewModel } from './ToastViewModel'
import { Toast } from '../../shared/Toast'

export class AudioViewModel extends BaseViewModel implements IHost {
    mailBox: HostMailbox
    private audio: AudioModel
    public constructor(route: RendererRouter, audio: AudioModel) {
        super()
        this.audio = audio
        audio.audioLoaded.do((sender, ev) => {
            route.send(new Message("audio", "statusHost", new Command(
                "invoke", "audioLoaded", this.audio.current
            )))
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
                    setTimeout(monitorSeekChange, 41, seekingAudio, vm)
                }
            }
            setTimeout(monitorSeekChange, 100, ev.current, this)
        })
        audio.audioEnded.do((sender, ev) => {
            this.notifyPropChange("playback");
        })
        this.mailBox = new HostMailbox("audio")
        this.mailBox.commandGot.do((sender, cmd) => {
            switch (cmd.action) {
                case 'update':
                    this.audio[cmd.request] = cmd.data
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
        return this.audio.timeDomainData
    }

    private frequencyDataHistory: Array<Float32Array>
    public get frequencyData() {
        return this.audio.frequencyData
    }

    public get current() {
        return this.audio.current;
    }

    public set current(value) {
        this.audio.current = value;
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
        return this.audio.playback
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
        this.notifyPropChange("seek");
    }

    public get picture() {
        return this.audio.current.picture
    }

    public get repeat() {
        return this.audio.repeat
    }
    public ctrlRepeat() {
        this.audio.repeat = (this.audio.repeat + 1) % 3
        this.notifyPropChange("repeat");
        switch (this.repeat) {
            case ERepeat.off:
                window["toastVM"].dropToast(
                    new Toast(0, 1000, `Repeat Off`))
                break;
            case ERepeat.current:
                window["toastVM"].dropToast(
                    new Toast(0, 1000, `Repeat Current Playing`))
                break;
            case ERepeat.list:
                window["toastVM"].dropToast(
                    new Toast(0, 1000, `Repeat List`))
                break;
        }

    }

    public get random() {
        return this.audio.random
    }
    public ctrlRandom() {
        this.audio.random = (this.audio.random + 1) % 2
        this.notifyPropChange("random");
        window["toastVM"].dropToast(
            new Toast(0, 1000, `Random ${this.random == 0 ? "off" : "on"}`))
    }
}