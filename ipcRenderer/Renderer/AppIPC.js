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

class AppIPCRenderer {
    _ws = null;
    _onGotMsgFrom = {};
    constructor(ws, onOpen, onClose) {
        this._ws = ws
        this._ws.onopen = onOpen;
        this._ws.onclose = onClose;
        this._ws.onmessage = (ev) => {
            let msg = JSON.parse(ev.data)
            if (msg.Receiver != "Renderer") return
            let sender_actions = this._onGotMsgFrom[msg.Sender]
            if (sender_actions) {
                if(sender_actions[msg.Action]){
                    this._onGotMsgFrom[msg.Sender][msg.Action](msg.Request, msg.Data);
                }else{
                    console.log(`Message got on channel "${msg.Channel}" without on this action.`)
                }
            } else {
                console.log(`Message got on channel "${msg.Channel}" without handling on this sender.`)
            }
        }
    }

    Send(msg) {
        console.log(`Renderer Send "${msg.Receiver}" Action "${msg.Action}" Request "${msg.Request}" Data "${msg.Data}"`)
        this._ws.send(JSON.stringify(msg))
    }

    Send2Audio(action, request, data) {
        let msg = new AppIPCMessage("Renderer", "Audio", action, request);
        msg.Data = data;
        this.Send(msg);
    }
    Send2MenuCenter(action, request, data) {
        let msg = new AppIPCMessage("Renderer", "MenuCenter", action, request);
        msg.Data = data;
        this.Send(msg);
    }
    Send2CrossProcessVariables(action, request, data) {
        let msg = new AppIPCMessage("Renderer", "CrossProcessVariables", action, request);
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