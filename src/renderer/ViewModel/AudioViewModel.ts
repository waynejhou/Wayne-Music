import { BaseViewModel } from '.'
import { IHost, HostMailbox, Message, Command  } from '../../shared/AppIpc'
import { Audio, EPlayback } from '../../shared/Audio'
import { RendererRouter } from '../Utils'
import { AudioModel } from '../Model'
import { IEventHandler, EventHandler } from '../../shared/EventHandler'

export class AudioViewModel extends BaseViewModel implements IHost {
    mailBox: HostMailbox
    private audio: AudioModel
    public onAudioLoaded: IEventHandler<Audio>
    public constructor(route: RendererRouter, audio: AudioModel) {
        super()
        this.audio = audio
        audio.audioLoaded.do((sender, ev) => {
            route.send(new Message("audio", "statusHost", new Command(
                "invoke", "audioLoaded", this.audio.current
            )))
            if(this.onAudioLoaded.invokable){
                this.onAudioLoaded.invoke(this, ev.current)
            }
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
                    this[cmd.request] = cmd.data
                    break;
                default:
                    console.log(`Unrecognized Action [${cmd.action}]`)
                    break;
            }
        })
        this.timeDomainDataHistory = new Array()
        this.frequencyDataHistory = new Array()
        this.onAudioLoaded = new EventHandler<Audio>()
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

    public setCurrentAndPlay(value) {
        this.audio.current = value;
        this.audio.audioLoaded.doOnce(()=>this.playback = EPlayback.playing)
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
        return "Unknow Album"
    }

    public get playback() {
        return this.audio.playback
    }
    public set playback(value) {
        this.audio.playback = value
        console.log(["asd", value, this.audio.playback])
        this.notifyPropChange("playback")
    }
    public ctrlPlayPause() {
        if (this.playback == EPlayback.paused) {
            this.playback = EPlayback.playing
        }
        else if (this.playback == EPlayback.stopped) {
            this.playback = EPlayback.playing
        }
        else if (this.playback == EPlayback.playing) {
            this.playback = EPlayback.paused
        }
        
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


}