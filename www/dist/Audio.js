"use strict";
const electron_1 = require("electron");
const howler_1 = require("howler");
const { IpcChannels } = electron_1.remote.require('./IpcChannels');
const wsServer = electron_1.remote.getGlobal('wsServer');
const EMPTY_AUDIO_DATA = {
    album: null,
    albumartist: null,
    artist: null,
    comment: null,
    date: null,
    disk: { no: null, of: null },
    genre: null,
    picture: "img/Ellipses.png",
    title: null,
    track: { no: null, of: null },
    url: null,
    year: null,
};
class AudioStateManager {
    constructor() {
        this._current = EMPTY_AUDIO_DATA;
    }
    get Current() {
        return this._current;
    }
    set Current(value) {
        if (this._howl) {
            this._howl.unload();
            this._howl = null;
        }
        console.log(value);
        console.log(value.url);
        this._howl = new howler_1.Howl({
            src: [value.url],
            volume: 0.25,
            loop: true,
            autoplay: true
        });
        this._current = value;
    }
}
let manager = new AudioStateManager();
electron_1.ipcRenderer.on(IpcChannels.audio_change_src, (e, arg) => {
    manager.Current = arg;
    wsServer.clients.forEach((client) => {
        client.send(JSON.stringify({ channel: IpcChannels.respond_current, data: arg }));
    });
});
electron_1.ipcRenderer.on(IpcChannels.wss_message_incoming, (e, arg) => {
    let { channel } = arg;
    if (channel == IpcChannels.query_current) {
        wsServer.clients.forEach((client) => {
            let data = manager.Current;
            client.send(JSON.stringify({ channel: IpcChannels.respond_current, data: data }));
        });
    }
});
