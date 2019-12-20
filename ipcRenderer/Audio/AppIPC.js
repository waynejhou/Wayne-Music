class AppIPCMessage {
    Receiver = null;
    Action = null;
    Request = null;
    Data = null;
    Channel = null;
    constructor(receiver, action, request) {
        this.Receiver = receiver
        this.Action = action
        this.Request = request
        this.Channel = `${this.Receiver}-${this.Action}-${this.Request}`
    }
}

class AppIPCAudio {
    _wsServer = null;
    _ipcRenderer = null;
    _onCallbacks = {}
    constructor(wss, ipcRenderer) {
        this._wsServer = wss
        this._ipcRenderer = ipcRenderer
        this._ipcRenderer.on("FromWebSocket", (ev, msg) => {
            if (msg.Receiver != "Audio") return
            if (this._onCallbacks[msg.Action]) this._onCallbacks[msg.Action](msg.Request, msg.Data);
        });
    }

    Send(msg) {
        if (msg.Receiver == "Renderer") {
            this._wsServer.clients.forEach((client) => {
                client.send(JSON.stringify(msg))
            })
        }
    }

    Send2Renderer(action, request, data) {
        let msg = new AppIPCMessage("Renderer", action, request);
        msg.Data = data;
        this.Send(msg);
    }
    On(action, callback) {
        this._onCallbacks[action] = callback;
    }

}
