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
    get Playing() { return 'playback-playing' },
    get Paused() { return 'playback-paused' },
    get Stopped() { return 'playback-stopped' },
}
const RepeatStateEnum = {
    get Off() { return 'repeat-off' },
    get Current() { return 'repeat-current' },
    get List() { return 'repeat-list' },
}
const RandomStateEnum = {
    get Off() { return 'random-off' },
    get On() { return 'random-on' },
}

function max(a, b) { return (a > b) ? a : b }
function min(a, b) { return (a < b) ? a : b }

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
            this.PlaybackState = PlaybackStateEnum.Playing
            appIpc.Send2Renderer("Respond", "Current", this.Current);
            appIpc.Send2Renderer("Respond", "CurrentList", this.CurrentList);
        })
        this._howl.on('end', () => {
            if (!this.Loop) {
                this.PlaybackState = PlaybackStateEnum.Stopped;
            }
            appIpc.Send2Renderer("Respond", "PlaybackState", this.PlaybackState);
            appIpc.Send2Renderer("Respond", "Seek", this.Seek);
        })
        this._current = value
    }
    _playbackState = PlaybackStateEnum.Stopped
    get PlaybackState() {
        return this._playbackState;
    }
    set PlaybackState(value) {
        if (!this._howl) return;
        if (!Object.values(PlaybackStateEnum).includes(value)) return;
        this._playbackState = value;
        if (value == PlaybackStateEnum.Playing) {
            this._howl.play()
        }
        if (value == PlaybackStateEnum.Paused) {
            this._howl.pause()
        }
        if (value == PlaybackStateEnum.Stopped) {
            this._howl.stop()
        }
        wsServer.clients.forEach((_) => {
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
    _volume = 0.5;
    get Volume() {
        if (this._howl) return this._howl.volume();
        return this._volume;
    }
    set Volume(value) {
        let val = max(0, min(1, value))
        this._volume = val;
        this._howl.volume(val);
        appIpc.Send2Renderer("Respond", 'Volume', val)
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
