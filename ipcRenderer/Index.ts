import { AudioData } from "./AudioData"


interface ExWindow extends Window {
    OnResponds: Object,
    Responds: Object,
    SendAudioQuery: (property: string) => void,
    SendAudioRemote: (property: string, value:Object) => void,
}

function GetWindow(): ExWindow { return <ExWindow><unknown>window }
var w = GetWindow();
w.OnResponds = {
    "Current": (audio: AudioData) => { },
    "PlaybackState": (playbackState: string) => { },
    "Seek": (seek: Number) => { },
    "Loop": (loop: boolean) => { }
}
w.Responds = {
    "Current": <AudioData>null,
    "PlaybackState": <string>null,
    "Seek": <Number>null,
    "Loop": <boolean>null,
}
w.SendAudioQuery = (property:string)=>{
    ws.send(JSON.stringify({
        channel: `audio-query-${property}`,
    }));
}
w.SendAudioRemote = (property:string, value:Object)=>{
    ws.send(JSON.stringify({
        channel: `audio-remote-${property}`,
        data: value
    }));
}
let ws = new WebSocket("ws://localhost:8888")
ws.onopen = (ev) => {
    console.log('open connection')
    w.SendAudioQuery("Current")
    w.SendAudioQuery("Loop")
    w.SendAudioQuery("PlaybackState")
}
ws.onmessage = (ev) => {
    let arg = JSON.parse(ev.data)
    let channel: string = arg.channel;
    let channel_split = channel.split('-')
    if (channel_split[0] == "audio") {
        if (channel_split[1] == "respond") {
            let cb = w.OnResponds[channel_split[2]]
            w.Responds[channel_split[2]] = arg.data
            if (cb) {
                cb(arg.data);
            }
        }

    }
}
ws.onclose = (ev) => {
    console.log('close connection')
}


