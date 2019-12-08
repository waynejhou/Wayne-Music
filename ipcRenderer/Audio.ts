import { ipcRenderer, remote } from 'electron';
import { Howl, Howler } from 'howler';
import { Server as WebSocketServer } from 'ws'
import { AudioData } from './AudioData'
const { IpcChannels } = remote.require('./IpcChannels')
const wsServer: WebSocketServer = remote.getGlobal('wsServer')

const EMPTY_AUDIO_DATA: AudioData = {
    album: null,
    albumartist: null,
    artist: null,
    comment: null,
    date: null,
    disk:  {no:null,of:null},
    genre: null,
    picture: "img/Ellipses.png",
    title: null,
    track: {no:null,of:null},
    url: null,
    year: null,
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
            loop: true,
            autoplay: true
        })
        this._current = value
    }
}

let manager = new AudioStateManager();

ipcRenderer.on(IpcChannels.audio_change_src, (e, arg) => {
    manager.Current = arg
    wsServer.clients.forEach((client) => {
        client.send(JSON.stringify({ channel: IpcChannels.respond_current, data: arg }))
    })
})

ipcRenderer.on(IpcChannels.wss_message_incoming, (e, arg) => {
    let { channel } = arg;
    if (channel == IpcChannels.query_current) {
        wsServer.clients.forEach((client) => {
            let data = manager.Current
            client.send(JSON.stringify({ channel: IpcChannels.respond_current, data: data }))
        })
    }
})