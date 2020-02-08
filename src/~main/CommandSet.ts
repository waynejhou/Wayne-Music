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

