import { dialog, App, FileFilter, BrowserWindow, shell } from 'electron'
import * as mm from 'music-metadata'
import * as path from 'path'
import * as fs from 'fs'
import * as crypto from 'crypto';
import * as sharp from 'sharp'

import * as fsx from '../Misc/FileSystemExtend'
import * as AppIpc from '../AppIpc'
import * as AppHost from '../AppHost'
import * as Data from '../../shared/Data'
import { Session } from '../AppSession';
import { cast2ExGlobal } from '../IExGlobal'
const g = cast2ExGlobal(global)

export class CommandCenter implements AppHost.IHost {
    public hostName: string
    public onGotMsg: (msg: AppIpc.Message) => void;
    private app: App = null;
    private exePath: string = null;
    public static defaultCoverPath = "img/Ellipses.png"
    private static audioFileFilter: FileFilter = {
        name: 'Audio',
        extensions: ['flac', 'mp3']
    }
    public constructor(app: App) {
        this.hostName = "cmdCenter"
        this.app = app;
        this.exePath = this.app.isPackaged ? path.dirname(this.app.getPath('exe')) : this.app.getAppPath();
        this.initCacheFunction()
    }

    public async openAudioDialog_loadAudio_SendAudio_Play(args: any) {
        // 確保必要參數的存在
        let optSess = null
        if (args && 'sess' in args){
            optSess = (<Session>args.sess)
        } 
        else{
            optSess = g.sessCenter.lastFocusSess
        }

        // 定義非同步的失敗行為與旗幟 
        let asyncFailed: boolean = false;
        function onCatched(err: any) { console.log(err); asyncFailed = true; return <any>null }

        // openDialog: 打開檔案視窗
        // 非同步的失敗 與 視窗取消 則直接結束函式
        const dialogResult = <Electron.OpenDialogReturnValue>await this.openAudioDialog(optSess.rendererWindow).catch(onCatched)
        if (asyncFailed) return
        if (dialogResult.canceled) return

        // loadAudio: 讀取檔案視窗
        // 不會發生非同步的失敗     
        console.log("before async loadAudioByPath")   
        const firstAudio = await this.loadAudioByPath(dialogResult.filePaths[0])
        console.log(firstAudio.url)
        console.log("after async loadAudioByPath")
        optSess.router.send(new AppIpc.Message("cmdCenter", "renderer", new AppIpc.Command("update", "current", firstAudio)))
        if(dialogResult.filePaths.length>1){
            console.log("before many async loadAudioByPath")   
            const restAudios = await Promise.all(dialogResult.filePaths.map( (fp) => this.loadAudioByPath(fp)))
            console.log(restAudios.map(v=>v.url))
            console.log("after many async loadAudioByPath")   
        }
    }

    public openAudioDialog(win?: BrowserWindow) {
        let optWin = win
        if (win !== undefined) {
            optWin = win
        }
        return dialog.showOpenDialog(optWin, {
            filters: <FileFilter[]>[{
                name: 'Audio',
                extensions: ['flac', 'mp3'],
            }],
            title: "Open Audio",
            properties: ["multiSelections"],
        })
    }

    public async loadAudioByPath(fp: string) {
        console.log(fp)
        // 定義非同步的失敗行為與旗幟
        let asyncFailed: boolean = false;
        function onCatched(err: any) { console.log(err); asyncFailed = true; }

        // 取得檔案 uid
        // 非同步的失敗 則放棄解析 metadata
        const uid = <string>await this.getFileUid(fp).catch(onCatched)
        if (asyncFailed) return new Data.Audio(fp)

        // 暫存是否存在
        const alreadyCached = uid in this.coverCacheListFiles
        // 讀取 metadata
        // 非同步的失敗 則放棄解析 metadata
        const parseOptions: mm.IOptions = {
            duration: false,
            skipCovers: alreadyCached,
            skipPostHeaders: true
        }
        const metadata = <mm.IAudioMetadata>await mm.parseFile(fp, parseOptions).catch(onCatched)
        if (asyncFailed) return new Data.Audio(fp)

        // 生成暫存封面路徑
        // 非同步的失敗 則使用預設圖片
        const coverPath = <string>await this.generateCache(uid, metadata).catch(onCatched)
        if (asyncFailed) return new Data.Audio(fp, metadata)

        return new Data.Audio(fp, metadata, coverPath)
    }

    public getFileUid(fp: string) {
        return new Promise<string>(async (resolve, reject) => {
            // 定義非同步的失敗行為與旗幟
            let asyncFailed: boolean = false;
            let stat:fs.Stats = null;
            try {
                console.log(`start get stat of []`)
                stat = await fs.promises.stat(fp)
                console.log(`end get stat of []`)
            } catch (error) {
                reject(error);
                return
            }
            if (asyncFailed) return
            const uid = crypto.createHash('sha512').update(`${fp}-${stat.mtimeMs}`).digest('hex')
            resolve(uid)
        })
    }

    public generateCache(uid: string, metadata: mm.IAudioMetadata) {
        return new Promise<string>(async (resolve, reject) => {
            // 定義非同步的失敗行為與旗幟
            let asyncFailed: boolean = false;
            function onCatched(err: any) { reject(err); asyncFailed = true; }

            const alreadyCached = uid in this.coverCacheListFiles
            if (alreadyCached) { resolve(`${this.coverCacheListFiles[uid]}.png`); return; }
            if (!(metadata.common.picture && metadata.common.picture.length > 0)) {
                reject("Audio Metadata has no picture."); return;
            }

            const pic = metadata.common.picture[0]
            const picInfo = <sharp.Metadata>await sharp(pic.data).metadata().catch(onCatched)
            if (asyncFailed) { return; }

            const data: Buffer = <Buffer>await this.formatCoverData(picInfo, pic.data).catch(onCatched);
            if (asyncFailed) { return; }

            const imgHash = crypto.createHash('sha512').update(data).digest('hex')
            const cachePath = path.join(this.coverCachePath, `${imgHash}.png`)
            await sharp(data).toFile(cachePath).catch(onCatched)
            if (asyncFailed) { return; }
            await fs.promises.appendFile(this.coverCacheListFilePath, `${uid}, ${imgHash}\n`).catch(onCatched)
            if (asyncFailed) { return; }
            this.coverCacheListFiles[uid] = imgHash
            resolve(`${this.coverCacheListFiles[uid]}.png`)
            return;
        })
    }

    public formatCoverData(info: sharp.Metadata, data: Buffer) {
        return new Promise<Buffer>(async (resolve, reject) => {
            // 定義非同步的失敗行為與旗幟
            let asyncFailed: boolean = false;
            function onCatched(err: any) { reject(err); asyncFailed = true; }
            if (info.width > 500 || info.height > 500) {
                const ret = <Buffer>await
                    sharp(data)
                        .resize(500, 500, { fit: "inside" }).png()
                        .toBuffer().catch(onCatched);
                if (asyncFailed) { return; }
                resolve(ret)
            } else {
                const ret = <Buffer>await
                    sharp(data)
                        .png().toBuffer().catch(onCatched)
                if (asyncFailed) { return; }
                resolve(ret)
            }
        })
    }

    private coverCachePath: string = null;
    private coverCacheListFilePath: string = null
    private coverCacheListFiles: CoverCacheList = null
    private async initCacheFunction() {
        this.coverCachePath = path.join(this.exePath, 'cover_cache');
        await fsx.ensureDirPathAvailable(this.coverCachePath)
            .catch((err) => { console.log(`Can't not create Caver Cache Path`); throw err })

        this.coverCacheListFilePath = path.join(this.coverCachePath, "list.csv")
        await fsx.ensureFilePathAvailable(this.coverCacheListFilePath)
            .catch((err) => { console.log(`Can't not create Cover Cache List File`); throw err })

        let { encoding, lines } = await fsx.readFileLines(this.coverCacheListFilePath)
        this.coverCacheListFiles = {}
        for (let index = 0; index < lines.length; index++) {
            let spltstr = lines[index].split(',').map(v => v.trim())
            this.coverCacheListFiles[spltstr[0]] = spltstr[1]
        }
    }


    /*
    public RemoveAudioInCurrentListByIdxs(args: any) {
        let idxs = <Array<Number>>args["idxs"]
        this.Send2Audio("RemoveByIdxs", "CurrentList", idxs)
    }

    public RemoveAllAudioInCurrentList(args: any) {
        this.Send2Audio("RemoveAll", "CurrentList", null)
    }

    public OpenLRCFileAtExternal(args: any) {
        if (args != null) shell.openItem(args)
    }

    public ReloadLRCFile(args: any) {
        if (args != null) this._lyricCenter.LoadAudioLyric(args)
    }*/
}

class CoverCacheList {
    [fileHash: string]: string
}
