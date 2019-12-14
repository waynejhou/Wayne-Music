import { AudioData } from "./AudioData"
import { EBADF } from "constants";


interface ExWindow extends Window {
    OnResponds: Object,
    Responds: Object,
    SendAudioQuery: (property: string) => void,
    SendAudioRemote: (property: string, value:Object) => void,
    IsShiftKeyHolding: boolean,
    On_Up_Press: (property: KeyboardEvent) => void
    On_Down_Press: (property: KeyboardEvent) => void
}

function GetWindow(): ExWindow { return <ExWindow><unknown>window }
var w = GetWindow();
w.OnResponds = {
    "Current": null,
    "PlaybackState": null,
    "Seek": null,
    "Loop": null,
    "CurrentList": null,
}
w.Responds = {
    "Current": <AudioData>null,
    "PlaybackState": <string>null,
    "Seek": <Number>null,
    "Loop": <boolean>null,
    "CurrentList": <AudioData[]>null,
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
w.IsShiftKeyHolding = false;
w.On_Down_Press = null;
w.On_Up_Press = null;

let ws = new WebSocket(`ws://${window.location.host}`)
ws.onopen = (ev) => {
    console.log('open connection')
    w.SendAudioQuery("Current")
    w.SendAudioQuery("Loop")
    w.SendAudioQuery("PlaybackState")
    w.SendAudioQuery("Seek")
}
ws.onmessage = (ev) => {
    let arg = JSON.parse(ev.data)
    let channel: string = arg.channel;
    let channel_split = channel.split('-')
    if (channel_split[0] == "audio") {
        if (channel_split[1] == "respond") {
            let cb = w.OnResponds[channel_split[2]]
            console.log(`Got ${channel_split[2]} Respond`)
            console.log(arg.data)
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

function duration2string(duration:number, sep:string=":"){
    let min = ("" + Math.floor(duration / 60)).padStart(2, "0")
    let sec = ("" + Math.floor(duration % 60)).padStart(2, "0")
    return `${min}${sep}${sec}`
}

window.addEventListener("keydown", (ev)=>{
    w.IsShiftKeyHolding = ev.shiftKey
    if(ev.keyCode==38){
        if(w.On_Up_Press)w.On_Up_Press(ev);
    }
    if(ev.keyCode==40){
        if(w.On_Down_Press)w.On_Down_Press(ev);
    }
})
window.addEventListener("keyup", (ev)=>{
    w.IsShiftKeyHolding = ev.shiftKey
})
