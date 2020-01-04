OnResponds = {}
Responds = {}
OnSeekChange = []


let ws = new WebSocket(`ws://${window.location.host}`)
AppIpc = new AppIPCRenderer(ws,
    (ev) => {
        console.log('open connection')
        AppIpc.Send2Audio("Query", "Current", null)
        AppIpc.Send2Audio("Query", "Loop", null)
        AppIpc.Send2Audio("Query", "PlaybackState", null)
        AppIpc.Send2Audio("Query", "Seek", null)
        AppIpc.Send2Audio("Query", "CurrentList", null)
        AppIpc.Send2Audio("Query", "Volume", null)
        AppIpc.Send2Audio("Query", "Lyric", null)
        AppIpc.Send2CrossProcessVariables("Get", "CurrentBody", null)
    },
    (ev) => {
        console.log('close connection')
    })

function ReceiveRespond(request, data) {
    let cb = OnResponds[request]
    Responds[request] = data
    if (cb) {
        cb(data);
    }
}

AppIpc.OnGotMsgFrom("Audio", "Respond", ReceiveRespond)


window.setInterval(() => {
    if (Responds["PlaybackState"] != 'playback-playing') return
    Responds.Seek += 0.033
    OnSeekChange.forEach(cb => {
        cb(Responds.Seek)
    });
}, 33);
