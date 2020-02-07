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

    public async openAudioDialog_loadAudio_SendAudio_Play(sess:Session) {
        // 定義非同步的失敗行為與旗幟 
        let asyncFailed: boolean = false;
        function onCatched(err: any) { console.log(err); asyncFailed = true; return <any>null }

        // openDialog: 打開檔案視窗
        // 非同步的失敗 與 視窗取消 則直接結束函式
        const dialogResult = <Electron.OpenDialogReturnValue>await this.openAudioDialog(sess.rendererWindow).catch(onCatched)
        if (asyncFailed) return
        if (dialogResult.canceled) return

        // loadAudio: 讀取檔案視窗
        // 不會發生非同步的失敗     
        const firstAudio = await this.loadAudioByPath(dialogResult.filePaths[0])
        sess.router.send(new AppIpc.Message("cmdCenter", "renderer", new AppIpc.Command("update", "current", firstAudio)))
        if(dialogResult.filePaths.length>1){
            const restAudios = await this.loadAudiosByPaths(dialogResult.filePaths)
             /** After Play List implement */
        }
    }

    public async loadAudiosByPaths_SendAudio_Play(filePaths:string[], sess:Session){
        if(filePaths.length<=0) return
        const firstAudio = await this.loadAudioByPath(filePaths[0])
        sess.router.send(new AppIpc.Message("cmdCenter", "renderer", new AppIpc.Command("update", "current", firstAudio)))
        if(filePaths.length<=1) return
        const restAudios = await this.loadAudiosByPaths(filePaths)
        /** After Play List implement */
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

    public loadAudiosByPaths(filePaths:string[]){
        return Promise.all(filePaths.map( (fp) => this.loadAudioByPath(fp)))
    }

    public async loadAudioByPath(fp: string) {
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

