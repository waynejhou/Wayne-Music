import * as fs from 'fs'

import { LyricParser } from '../Misc/LyricParser'
import * as AppHost from '../AppHost'
import * as AppIpc from '../AppIpc'

export class LyricCenter implements AppHost.IHost {
    public hostName: string
    private router: AppIpc.MainRouter;
    public constructor(ipcMg: AppIpc.MainRouter) {
        this.hostName = "lyricCenter"
        this.router = ipcMg;
    }
    public onGotMsg: (msg: AppIpc.Message) => void = (msg) => {
        for (let index = 0; index < msg.commands.length; index++) {
            const cmd = msg.commands[index];
            if (cmd.action == "query" && cmd.request == "lyric") {
                if (cmd.data != null) {
                    this.loadAudioLyric(cmd.data)
                }
            }
        }
    }

    public send2Renderer(...cmds:AppIpc.Command[]){
        this.router.send(new AppIpc.Message(this.hostName, "renderer", ...cmds))
    }

    public loadAudioLyric(filePath: string) {
        let lyricPaths = LyricParser.GuessLyricPaths(filePath);
        let lyricPath = null;
        for (let index = 0; index < lyricPaths.length; index++) {
            const path = lyricPaths[index];
            let stat = null;
            try {
                stat = fs.statSync(path)
            } catch (e) { }
            if (stat) {
                lyricPath = path
                break;
            }
        }
        if (lyricPath) {
            this.send2Renderer(new AppIpc.Command('respond', 'lyric', LyricParser.Parse(lyricPath)))
        } else {
            this.send2Renderer(new AppIpc.Command('respond', 'lyric', { path: null, data: LyricParser.NotFound }))
        }
    }
}