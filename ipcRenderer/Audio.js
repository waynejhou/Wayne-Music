const { ipcRenderer, remote } = require('electron');
var { Howl } = require('howler');

const wsServer = remote.getGlobal('wsServer')
const appIpc = new AppIPCAudio(wsServer, ipcRenderer)

const EMPTY_AUDIO_DATA = {
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
    constructor() { }
    _howl = null;
    _current = EMPTY_AUDIO_DATA
    get Current() {
        return this._current
    }
    set Current(value) {
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
    _playbackState = 'stopped'
    get PlaybackState() {
        return this._playbackState;
    }
    set PlaybackState(value) {
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
    _loop = false
    get Loop() {
        return this._loop;
    }
    set Loop(value) {
        this._loop = !!value;
        if (this._howl) { this._howl.loop(!!value); }
        appIpc.Send2Renderer("Respond", "Loop", this.Loop);
    }
    get Seek() {
        if (!this._howl) { return 0; }
        let ret = this._howl.seek();
        if (typeof ret != "number") { return 0; }
        return ret;
    }
    set Seek(value) {
        if (!this._howl) return
        if (value >= this.Current.duration) {
            value = this.Current.duration -= 0.05
        }

        this._howl.seek(value);
        appIpc.Send2Renderer("Respond", "Seek", value);
    }
    _currentList = new Array();

    get CurrentList() {
        return this._currentList;
    }

}

let manager = new AudioStateManager();

appIpc.On('Remote', (request, data) => {
    console.log(`Got Remote "${request}"`)
    console.log(data)
    manager[request] = data
})
appIpc.On('Query', (request, data) => {
    appIpc.Send2Renderer("Respond", request, manager[request])
})
appIpc.On('Add', (request, data) => {
    console.log(`Got Add "${request}"`)
    console.log(data)
    manager[request].push(data)
})
