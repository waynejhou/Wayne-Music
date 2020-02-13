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
            this.notifyPropChange("picture")
            function monitorSeekChange(seekingAudio:Audio, vm:AudioViewModel){
                vm.notifyPropChange("seek");
                if(seekingAudio==vm.current){
                    setTimeout(monitorSeekChange, 33, seekingAudio, vm)
                }
            }
            setTimeout(monitorSeekChange, 33, ev.current,this)
        })
        audio.audioEnded.do((sender, ev)=>{
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
    }

    public get current() {
        return this.audio.current;
    }
    public set current(value) {
        this.audio.current = value
    }

    public get duration(){
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

    public get seek(){
        return this.audio.seek
    }
    public set seek(value){
        this.audio.seek = value
    }

    public get picture(){
        return this.audio.current.picture
    }
}