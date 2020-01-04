import { dialog, App, FileFilter, BrowserWindow, shell } from 'electron'
import * as mm from 'music-metadata'
import { AudioData } from '../AudioData'
import { AppIPCMain, AppIPCMessage } from '../AppIPCMain'
import { IAppIPCHost } from "./IAppIPCHost"
import * as path from 'path'
import * as fs from 'fs'
import * as crypto from 'crypto';
import * as sharp from 'sharp'
import { LyricParser, LyricLine } from '../LyricParser'


function newFileFilter(name: string, exts: string[]): FileFilter {
    return {
        name: name,
        extensions: exts
    }
}
function GetFileUid(path: string): string {
    let stat = fs.statSync(path)
    return crypto.createHash('sha512').update(`${path}-${stat.mtimeMs}`).digest('hex')
}
function ResizeTooBigImg2PNG(buffer: Buffer, callback: (buffer: Buffer) => void) {
    sharp(buffer)
        .resize(500, 500, { fit: "inside" })
        .png()
        .toBuffer()
        .then(callback)
        .catch((err) => {
            console.log(err)
        });
}
function Img2PNG(buffer: Buffer, callback: (buffer: Buffer) => void) {
    sharp(buffer)
        .png()
        .toBuffer()
        .then(callback)
        .catch((err) => {
            console.log(err)
        })
}
class CoverCacheList {
    [fileHash: string]: string
}
export class AppCommandCenter implements IAppIPCHost {
    public HostName: string = "CmdCenter"
    public OnGotMsg: (msg: AppIPCMessage) => void;
    private _app: App = null;
    private _win: BrowserWindow = null;
    private _ipcMg: AppIPCMain = null;
    private _exePath: string = null;
    public constructor(app: App, win: BrowserWindow, ipcMg: AppIPCMain) {
        this._app = app;
        this._win = win;
        this._ipcMg = ipcMg;
        this._exePath = this._app.isPackaged ? path.dirname(this._app.getPath('exe')) : this._app.getAppPath();
        this.initCacheFunction()
    }
    private Send2Audio(action: string, request: string, data: any) {
        this._ipcMg.Send((() => {
            let ret = new AppIPCMessage(this.HostName, "Audio", action, request);
            ret.Data = data;
            return ret;
        })());
    }

    public OpenDialog_Load_Play(args: any): void {
        this.OpenDialog((result) => {
            if (result.canceled) return;
            result.filePaths.forEach((filePath, idx) => {
                this.LoadAudioFile(filePath, (metadata, picture) => {
                    let data = new AudioData(filePath, metadata, picture);
                    let lyric = this.LoadAudioLyric(filePath)
                    if (idx == 0) {
                        this.Send2Audio("Remote", "AudioDataSet", { AudioData: data, ExternalData: { Lyric: lyric } })
                    }
                    this.Send2Audio("Add", "CurrentList", data)
                })
            })
        });
    }

    public OpenDialog(callback: (result: { canceled: boolean, filePaths: string[] }) => void) {
        dialog.showOpenDialog(this._win, {
            filters: [newFileFilter('Audio', ['flac', 'mp3']),],
            title: "Open Audio",
            properties: ["multiSelections"],
        })
            .then(callback)
            .catch((err: any) => {
                console.error(err.message);
            });
    }

    public LoadAudioFile(filePath: string, callback: (metadata: mm.IAudioMetadata, picture: string) => void): void {
        let uid = GetFileUid(filePath);
        let hasCache = uid in this._coverCacheListFiles
        let parseOptions: mm.IOptions = {
            duration: false,
            skipCovers: hasCache,
            skipPostHeaders: true
        }
        mm.parseFile(filePath, parseOptions).then((metadata) => {
            if (hasCache) {
                callback(metadata, `${this._coverCacheListFiles[uid]}.png`)
            } else {
                if (metadata.common.picture && metadata.common.picture.length > 0) {
                    let pic = metadata.common.picture[0]
                    sharp(pic.data).metadata().then((imgmetadata) => {
                        if (imgmetadata.width > 500 || imgmetadata.height > 500) {
                            ResizeTooBigImg2PNG(pic.data, (buffer) => {
                                this.AddCoverCache(uid, buffer, () => {
                                    callback(metadata, `${this._coverCacheListFiles[uid]}.png`)
                                })
                            })
                        } else {
                            Img2PNG(pic.data, (buffer) => {
                                this.AddCoverCache(uid, buffer, () => {
                                    callback(metadata, `${this._coverCacheListFiles[uid]}.png`)
                                })
                            })
                        }
                    })
                } else {
                    callback(metadata, "img/Ellipses.png")
                }
            }
        })
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
        if (lyricPath) return  { path: lyricPath, data: LyricParser.Parse(lyricPath)}
        return { path: null, data: null};
    }

    private _coverCachePath: string = null;
    private _coverCacheListFilePath: string = null
    private _coverCacheListFiles: CoverCacheList = {}
    private initCacheFunction() {
        this._coverCachePath = path.join(this._exePath, 'Cover Cache');
        fs.access(this._coverCachePath, fs.constants.F_OK, (err) => {
            // dir not exist
            if (err) {
                fs.mkdirSync(this._coverCachePath, { recursive: true });
            }
        })
        this._coverCacheListFilePath = path.join(this._coverCachePath, "list.json")
        fs.access(this._coverCacheListFilePath, fs.constants.F_OK, (err) => {
            if (err) {
                fs.writeFileSync(this._coverCacheListFilePath, "{}")
            }
            this._coverCacheListFiles = <CoverCacheList>JSON.parse(fs.readFileSync(this._coverCacheListFilePath).toString())
        })
    }

    public AddCoverCache(fileUid: string, buffer: Buffer, callback: () => void) {
        let imgHash = crypto.createHash('sha512').update(buffer).digest('hex')
        let cachePath = path.join(this._coverCachePath, `${imgHash}.png`)
        sharp(buffer).toFile(cachePath, (err, info) => {
            if (err) {
                console.log(err)
            }
            this._coverCacheListFiles[fileUid] = imgHash
            fs.writeFileSync(this._coverCacheListFilePath, JSON.stringify(this._coverCacheListFiles))
            callback();
        })
    }

    public RemoveAudioInCurrentListByIdxs(args: any) {
        let idxs = <Array<Number>>args["idxs"]
        this.Send2Audio("RemoveByIdxs", "CurrentList", idxs)
    }

    public RemoveAllAudioInCurrentList(args: any) {
        this.Send2Audio("RemoveAll", "CurrentList", null)
    }

    public OpenLRCFileAtExternal(args:any){
        shell.openItem(args)
    }

}