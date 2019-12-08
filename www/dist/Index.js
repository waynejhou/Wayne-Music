"use strict";
function GetWindow() { return window; }
var w = GetWindow();
w.onRespondCurrent = (data) => {
    console.log(data.url);
};
let ws = new WebSocket("ws://localhost:8888");
ws.onopen = (ev) => {
    console.log('open connection');
    ws.send(JSON.stringify({
        channel: 'query-current'
    }));
};
ws.onmessage = (ev) => {
    let arg = JSON.parse(ev.data);
    console.log(arg);
    let { channel } = arg;
    if (channel == "respond-current") {
        let audio = arg.data;
        console.log(w.onRespondCurrent);
        console.log(audio);
        if (w.onRespondCurrent) {
            w.onRespondCurrent(audio);
        }
    }
};
ws.onclose = (ev) => {
    console.log('close connection');
};
