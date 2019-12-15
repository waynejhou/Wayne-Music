import { AppIPCRenderer } from "./resources/app.asar/www/dist/AppIPCRenderer";

interface ExWindow extends Window {
    OnResponds: { [id: string]: (data: any) => void; },
    Responds: { [id: string]: any },
    AppIpc: AppIPCRenderer,
    IsShiftKeyHolding: boolean,
    On_Up_Press: (property: KeyboardEvent) => void
    On_Down_Press: (property: KeyboardEvent) => void
}

function GetWindow(): ExWindow { return <ExWindow><unknown>window }
var w = GetWindow();

w.OnResponds = {}
w.Responds = {}
w.IsShiftKeyHolding = false;
w.On_Down_Press = null;
w.On_Up_Press = null;

let ws = new WebSocket(`ws://${window.location.host}`)
w.AppIpc = new AppIPCRenderer(ws,
    (ev) => {
        console.log('open connection')
        w.AppIpc.Send2Audio("Query", "Current", null)
        w.AppIpc.Send2Audio("Query", "Loop", null)
        w.AppIpc.Send2Audio("Query", "PlaybackState", null)
        w.AppIpc.Send2Audio("Query", "Seek", null)
        w.AppIpc.Send2Audio("Query", "CurrentList", null)
    },
    (ev) => {
        console.log('close connection')
    })
w.AppIpc.On("Respond", (request, data) => {
    let cb = w.OnResponds[request]
    console.log(`Got ${request} Respond`)
    w.Responds[request] = data
    console.log(w.Responds[request])
    if (cb) {
        cb(data);
    }
})

function duration2string(duration: number, sep: string = ":") {
    let min = ("" + Math.floor(duration / 60)).padStart(2, "0")
    let sec = ("" + Math.floor(duration % 60)).padStart(2, "0")
    return `${min}${sep}${sec}`
}

window.addEventListener("keydown", (ev) => {
    w.IsShiftKeyHolding = ev.shiftKey
    if (ev.keyCode == 38) {
        if (w.On_Up_Press) w.On_Up_Press(ev);
    }
    if (ev.keyCode == 40) {
        if (w.On_Down_Press) w.On_Down_Press(ev);
    }
})
window.addEventListener("keyup", (ev) => {
    w.IsShiftKeyHolding = ev.shiftKey
})
