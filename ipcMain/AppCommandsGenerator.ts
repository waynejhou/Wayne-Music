import { dialog, App, FileFilter, BrowserWindow } from 'electron'
import * as mm from 'music-metadata'
import { AudioData } from './AudioData'
import { AppIPCMain, AppIPCMessage } from './AppIPCMain'
import * as path from 'path'
import * as fs from 'fs'
import * as crypto from 'crypto';
import * as sharp from 'sharp'


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

export class AppCommandsGenerator {
    private _app: App = null;
    private _win: BrowserWindow = null;
    private _ipcMg: AppIPCMain = null;
    private _exePath: string = null;
    private _coverCachePath: string = null;
    private _coverCacheListFilePath: string = null
    private _coverCacheListFiles: CoverCacheList = {}
    public constructor(app: App, win: BrowserWindow, ipcMg: AppIPCMain) {
        this._app = app;
        this._win = win;
        this._ipcMg = ipcMg;
        this._exePath = app.isPackaged ? path.dirname(app.getPath('exe')) : app.getAppPath();
        console.log(this._exePath)
        this._coverCachePath = path.join(this._exePath, 'Cover Cache');
        console.log(this._coverCachePath)
        fs.access(this._coverCachePath, fs.constants.F_OK, (err) => {
            // dir not exist
            if(err){
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
    public OpenDialog_Load_Play(): void {
        this.OpenDialog((result) => {
            if (result.canceled) return;
            result.filePaths.forEach((filePath, idx) => {
                console.log(`${idx}. ${filePath}`)
                this.LoadAudioFile(filePath, (metadata, picture) => {
                    let data = new AudioData(filePath, metadata, picture);
                    console.log(`*${idx}. ${data.url}`)
                    if (idx == 0) {
                        this._ipcMg.Send2Audio("Remote", "Current", data);
                    }
                    this._ipcMg.Send2Audio("Add", "CurrentList", data);
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
                if (metadata.common.picture.length > 0) {
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


}