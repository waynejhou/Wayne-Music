import { ipcRenderer, remote } from 'electron';
import { Howl, Howler } from 'howler';
import { Server as WebSocketServer } from 'ws'
import { AudioData } from './AudioData'
import { IpcChannels as IpcChannelsType } from './IpcChannels'
const IpcChannels = ((): typeof IpcChannelsType => { return remote.require('./IpcChannels').IpcChannels })()
const wsServer: WebSocketServer = remote.getGlobal('wsServer')

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
        console.log(value)
        console.log(value.url)
        this._howl = new Howl({
            src: [value.url],
            volume: 0.25,
            loop: true
        })
        this._howl.once('load', () => {
            this.PlaybackState = PlaybackStateEnum.playing
            wsServer.clients.forEach((client) => {
                client.send(JSON.stringify({ channel: IpcChannels.audio_respond_current, data: this.Current }))
                client.send(JSON.stringify({ channel: IpcChannels.audio_respond_currentlist, data: this.CurrentList }))
            })
        })
        this._howl.on('end', () => {
            if (!this.Loop) {
                this.PlaybackState = PlaybackStateEnum.stopped;
            }
            wsServer.clients.forEach((client) => {
                client.send(JSON.stringify({ channel: IpcChannels.audio_respond_playbackState, data: this.PlaybackState }))
                client.send(JSON.stringify({ channel: IpcChannels.audio_respond_seek, data: this.Seek }))
            })

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
            client.send(JSON.stringify({ channel: IpcChannels.audio_respond_playbackState, data: this.PlaybackState }))
            client.send(JSON.stringify({ channel: IpcChannels.audio_respond_seek, data: this.Seek }))
        })
    }
    private _loop: boolean = false
    public get Loop(): boolean {
        return this._loop;
    }
    public set Loop(value: boolean) {
        this._loop = !!value;
        if (this._howl) { this._howl.loop(!!value); }
        wsServer.clients.forEach((client) => {
            client.send(JSON.stringify({ channel: IpcChannels.audio_respond_loop, data: this.Loop }))
        })
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
        wsServer.clients.forEach((client) => {
            client.send(JSON.stringify({ channel: IpcChannels.audio_respond_seek, data: value }))
        })
    }
    private _currentList: AudioData[] = new Array<AudioData>();

    public get CurrentList(): AudioData[] {
        return this._currentList;
    }

}

let manager = new AudioStateManager();

ipcRenderer.on(IpcChannels.audio_change_src, (e, arg) => {
    manager.Current = arg
    manager.CurrentList.push(arg);
})
ipcRenderer.on(IpcChannels.audio_add_src, (e, arg) => {
    manager.CurrentList.push(arg);
    wsServer.clients.forEach((client) => {
        client.send(JSON.stringify({ channel: IpcChannels.audio_query_currentlist, data: manager.CurrentList }))
    })
})

ipcRenderer.on(IpcChannels.wss_message_incoming, (e, arg) => {
    let channel: string = arg.channel;
    let channel_split = channel.split('-')
    if (channel_split[0] == "audio") {
        if (channel_split[1] == "query") {
            console.log("Got Query")
            console.log(channel_split[2])
            wsServer.clients.forEach((client) => {
                let resData = manager[channel_split[2]]
                let resCh = `${channel_split[0]}-respond-${channel_split[2]}`
                client.send(JSON.stringify({ channel: resCh, data: resData }))
            })
        }
        if (channel_split[1] == "remote") {
            let remotedProperty = channel_split[2];
            let remoteData = arg.data;
            console.log("Got Remote")
            console.log(arg.data)
            manager[remotedProperty] = remoteData;
        }
    }
})
