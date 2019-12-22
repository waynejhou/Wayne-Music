
OnResponds = {}
Responds = {}


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

