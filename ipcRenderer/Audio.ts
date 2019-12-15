import { ipcRenderer, remote } from 'electron';
import { Howl, Howler } from 'howler';
import { Server as WebSocketServer } from 'ws'

import { AudioData } from './resources/app.asar/www/dist/AudioData'
import { AppIPCAudio } from './resources/app.asar/www/dist/AppIPCAudio'

const wsServer: WebSocketServer = remote.getGlobal('wsServer')
const appIpc = new AppIPCAudio(wsServer, ipcRenderer)

const EMPTY_AUDIO_DATA: AudioData = {
    album: null,
    albumartist: null,
    artist: null,
    comment: null,
    date: null,
    disk: { no: null, of: null },
    duration: 0,
    genre: null,
    picture: "img/Ellipses.png",
    title: null,
    track: { no: null, of: null },
    url: null,
    year: null,
}

const PlaybackStateEnum = {
    playing: 'playing',
    paused: 'paused',
    stopped: 'stopped',
}

class AudioStateManager {
    public constructor() { }
    private _howl: Howl
    private _current: AudioData = EMPTY_AUDIO_DATA
    public get Current(): AudioData {
        return this._current
    }
    public set Current(value: AudioData) {
        if (this._howl) {
            this._howl.unload()
            this._howl = null;
        }
        this._howl = new Howl({
            src: [value.url],
            volume: 0.25,
            loop: true
        })
        this._howl.once('load', () => {
            this.PlaybackState = PlaybackStateEnum.playing
            appIpc.Send2Renderer("Respond", "Current", this.Current);
            appIpc.Send2Renderer("Respond", "CurrentList", this.CurrentList);
        })
        this._howl.on('end', () => {
            if (!this.Loop) {
                this.PlaybackState = PlaybackStateEnum.stopped;
            }
            appIpc.Send2Renderer("Respond", "PlaybackState", this.PlaybackState);
            appIpc.Send2Renderer("Respond", "Seek", this.Seek);
        })
        this._current = value
    }
    private _playbackState: string = 'stopped'
    public get PlaybackState(): string {
        return this._playbackState;
    }
    public set PlaybackState(value: string) {
        if (!this._howl) return;
        if (!(value in PlaybackStateEnum)) return;
        this._playbackState = value;
        if (value == PlaybackStateEnum.playing) {
            this._howl.play()
        }
        if (value == PlaybackStateEnum.paused) {
            this._howl.pause()
        }
        if (value == PlaybackStateEnum.stopped) {
            this._howl.stop()
        }
        wsServer.clients.forEach((client) => {
            appIpc.Send2Renderer("Respond", "PlaybackState", this.PlaybackState);
            appIpc.Send2Renderer("Respond", "Seek", this.Seek);
        })
    }
    private _loop: boolean = false
    public get Loop(): boolean {
        return this._loop;
    }
    public set Loop(value: boolean) {
        this._loop = !!value;
        if (this._howl) { this._howl.loop(!!value); }
        appIpc.Send2Renderer("Respond", "Loop", this.Loop);
    }
    public get Seek(): number {
        if (!this._howl) { return 0; }
        let ret = this._howl.seek();
        if (typeof ret != "number") { return 0; }
        return <number><unknown>ret;
    }
    public set Seek(value: number) {
        if (!this._howl) return
        if (value >= this.Current.duration) {
            value = this.Current.duration -= 0.05
        }

        this._howl.seek(value);
        appIpc.Send2Renderer("Respond", "Seek", value);
    }
    private _currentList: AudioData[] = new Array<AudioData>();

    public get CurrentList(): AudioData[] {
        return this._currentList;
    }

}

let manager = new AudioStateManager();

appIpc.On('Remote', (request, data)=>{
    console.log(data)
    manager[request] = data
})
appIpc.On('Query', (request, data)=>{
    console.log(data)
    appIpc.Send2Renderer("Respond", request, manager[request])
})
appIpc.On('Add', (request, data)=>{
    console.log(data)
    manager[request].push(data)
})
