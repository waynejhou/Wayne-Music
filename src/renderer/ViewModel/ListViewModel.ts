import { BaseViewModel } from './BaseViewModel'
import { IHost, HostMailbox } from '../../shared/AppIpc'
import { Audio, ERepeat, ERandom, EPlayback } from '../../shared/Audio'
import { AudioModel } from '../Model'
import { Toast } from '../../shared/Toast'
import { shuffle } from 'lodash'
import { ExWindow } from '../ExWindow'
const w = window as ExWindow

export class ListViewModel extends BaseViewModel implements IHost {
    public mailBox: HostMailbox
    private _current: Audio[]
    private suffled: Audio[]
    private historied: Audio[]
    private audio: AudioModel
    private _repeat: ERepeat
    private _random: ERandom
    public constructor(audio: AudioModel) {
        super()
        this._current = []
        this.suffled = []
        this.historied = []
        this._random = ERandom.off
        this._repeat = ERepeat.off
        this.audio = audio
        audio.audioLoaded.do((sender, args) => {
            this.historied.push(args.current)
        })
        audio.audioEnded.do(() => {
            console.log(this.canGetNext)
            if (this.canGetNext) this.toNext()
        })
        this.mailBox = new HostMailbox("list")
        this.mailBox.commandGot.do((sender, cmd) => {
            if (cmd.action == "add") {
                this.add(cmd.data)
                this.notifyPropChange("current")
            }
        })
    }



    public get current() {
        return Object.seal(new Array(...this._current))
    }

    public add(audio: Audio) {
        this._current.push(audio)
        if (this.random) this.suffled = shuffle(this.current)
        this.notifyPropChange("canGetNext");
        this.notifyPropChange("canGetNext");
    }

    public get repeat() {
        return this._repeat
    }
    public set repeat(value) {
        if (this._repeat == value) return
        this.audio.loop = value == ERepeat.current
        this._repeat = value
        this.notifyPropChange("repeat");
        switch (this.repeat) {
            case ERepeat.off:
                w.toastVM.dropToast(
                    new Toast(0, 1000, `Repeat Off`))
                break;
            case ERepeat.current:
                w.toastVM.dropToast(
                    new Toast(0, 1000, `Repeat Current Playing`))
                break;
            case ERepeat.list:
                w.toastVM.dropToast(
                    new Toast(0, 1000, `Repeat List`))
                break;
        }
    }
    public ctrlRepeat() {
        this.repeat = (this.repeat + 1) % 3
    }

    public get random() {
        return this._random
    }
    public set random(value) {
        this.suffled = shuffle(this.current)
        this._random = value
        this.notifyPropChange("random");
        w.toastVM.dropToast(
            new Toast(0, 1000, `Random ${this.random == 0 ? "off" : "on"}`))
    }
    public ctrlRandom() {
        this.random = (this.random + 1) % 2
    }

    public get poolForNext() {
        return (this._random ? this.suffled : this.current)
    }
    public get poolForLast() {
        if (this.historied.length != 0) return this.historied
        if (this.random) return this.suffled
        return this.current
    }

    public get canGetNext() {
        const list = this.poolForNext
        return list.length != 0 && list.findIndex((v) => v.url == this.audio.current.url) != list.length-1
    }

    public get canGetLast() {
        return this.poolForLast.length != 0
    }

    public get next() {
        const list = this.poolForNext
        if (list.length == 0) throw Error("Nothing To Next");
        const found = list.findIndex((v) => v.url == this.audio.current.url)
        if (found < 0) return list[0]
        if (this.repeat == ERepeat.off && found == list.length - 1) throw Error("Nothing To Next")
        return list[(found + 1) % list.length]
    }
    public get last() {
        const list = this.poolForLast
        if (list.length == 0) return Audio.default;
        const found = list.findIndex((v) => { v.url == this.audio.current.url })
        if (found < 0) return list[0]
        return list[(found + list.length - 1) % list.length]
    }

    public toNext() {
        this.audio.current = this.next
        this.audio.audioLoaded.doOnce(()=>{
            w.audioVM.playback = EPlayback.playing
        })
    }
    public toLast() {
        this.audio.current = this.last
        this.audio.audioLoaded.doOnce(()=>{
            w.audioVM.playback = EPlayback.playing
        })
    }
}