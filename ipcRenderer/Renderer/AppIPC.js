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

class AppIPCRenderer {
    _ws = null;
    _onCallbacks = {}
    constructor(ws, onOpen, onClose) {
        this._ws = ws
        this._ws.onopen = onOpen;
        this._ws.onclose = onClose;
        this._ws.onmessage = (ev) => {
            let msg = JSON.parse(ev.data)
            if (msg.Receiver != "Renderer") return
            if (this._onCallbacks[msg.Action]) this._onCallbacks[msg.Action](msg.Request, msg.Data);
        }
    }

    Send(msg) {
        this._ws.send(JSON.stringify(msg))
    }

    Send2Audio(action, request, data) {
        let msg = new AppIPCMessage("Audio", action, request);
        msg.Data = data;
        this.Send(msg);
    }
    Send2Main(action, request, data) {
        let msg = new AppIPCMessage("Main", action, request);
        msg.Data = data;
        this.Send(msg);
    }
    On(action, callback) {
        this._onCallbacks[action] = callback;
    }

}