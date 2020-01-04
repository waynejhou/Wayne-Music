import { AppIPCMain, AppIPCMessage } from '../AppIPCMain'
import { IAppIPCHost } from "./IAppIPCHost"
import { LyricParser, LyricLine } from '../LyricParser'
import * as fs from 'fs'

export class AppLyricCenter implements IAppIPCHost {
    public HostName: string = "LyricCenter"
    private _ipcMg: AppIPCMain = null;
    public constructor(ipcMg: AppIPCMain) {
        this._ipcMg = ipcMg;
    }
    private Send2Audio(action: string, request: string, data: any) {
        this._ipcMg.Send((() => {
            let ret = new AppIPCMessage(this.HostName, "Audio", action, request);
            ret.Data = data;
            return ret;
        })());
    }

    public LoadAudioLyric(filePath: string) {
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
            this.Send2Audio("Respond", "Lyric", { path: lyricPath, data: LyricParser.Parse(lyricPath) })
        } else {
            this.Send2Audio("Respond", "Lyric", { path: null, data: LyricParser.NotFound })
        }

    }

    public OnGotMsg: (msg: AppIPCMessage) => void = (msg) => {
        console.log(msg.Channel)
        if(msg.Action=="Query" && msg.Request=="Lyric"){
            if(msg.Data!=null){
                this.LoadAudioLyric(msg.Data)
            }
        }
    }

}