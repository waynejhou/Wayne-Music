class AppIPCMessage {
    Receiver = null;
    Action = null;
    Request = null;
    Data = null;
    Channel = null;
    constructor(sender, receiver, action, request) {
        this.Sender = sender
        this.Receiver = receiver
        this.Action = action
        this.Request = request
        this.Channel = `${this.Sender}-${this.Receiver}-${this.Action}-${this.Request}`
    }
}

class AppIPCAudio {
    _wsServer = null;
    _ipcRenderer = null;
    _onGotMsgFrom = {};
    constructor(wss, ipcRenderer) {
        this._wsServer = wss
        this._ipcRenderer = ipcRenderer
        this._ipcRenderer.on("FromWebSocket", (ev, msg) => {
            if (msg.Receiver != "Audio") return
            let sender_actions = this._onGotMsgFrom[msg.Sender]
            if (sender_actions) {
                if(sender_actions[msg.Action]){
                    this._onGotMsgFrom[msg.Sender][msg.Action](msg.Request, msg.Data);
                }else{
                    console.log(`Message got on channel "${msg.Channel}" without  on this action.`)
                }
            } else {
                console.log(`Message got on channel "${msg.Channel}" without handling on this sender.`)
            }
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
        let msg = new AppIPCMessage("Audio", "Renderer", action, request);
        msg.Data = data;
        this.Send(msg);
    }
    
    OnGotMsgFrom(sender, action, callback) {
        if (!this._onGotMsgFrom[sender]) {
            this._onGotMsgFrom[sender] = {}
        }
        this._onGotMsgFrom[sender][action] = callback;
    }

}
