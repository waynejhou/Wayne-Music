
OnResponds = {}
Responds = {}
IsShiftKeyHolding = false;
On_Down_Press = null;
On_Up_Press = null;

let ws = new WebSocket(`ws://${window.location.host}`)
AppIpc = new AppIPCRenderer(ws,
    (ev) => {
        console.log('open connection')
        AppIpc.Send2Audio("Query", "Current", null)
        AppIpc.Send2Audio("Query", "Loop", null)
        AppIpc.Send2Audio("Query", "PlaybackState", null)
        AppIpc.Send2Audio("Query", "Seek", null)
        AppIpc.Send2Audio("Query", "CurrentList", null)
    },
    (ev) => {
        console.log('close connection')
    })
AppIpc.On("Respond", (request, data) => {
    let cb = OnResponds[request]
    console.log(`Got ${request} Respond`)
    Responds[request] = data
    console.log(Responds[request])
    if (cb) {
        cb(data);
    }
})

function duration2string(duration, sep = ":") {
    let min = ("" + Math.floor(duration / 60)).padStart(2, "0")
    let sec = ("" + Math.floor(duration % 60)).padStart(2, "0")
    return `${min}${sep}${sec}`
}

window.addEventListener("keydown", (ev) => {
    IsShiftKeyHolding = ev.shiftKey
    if (ev.keyCode == 38) {
        if (On_Up_Press) On_Up_Press(ev);
    }
    if (ev.keyCode == 40) {
        if (On_Down_Press) On_Down_Press(ev);
    }
})
window.addEventListener("keyup", (ev) => {
    IsShiftKeyHolding = ev.shiftKey
})
