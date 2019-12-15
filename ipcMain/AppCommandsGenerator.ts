import { dialog, App, FileFilter, BrowserWindow } from 'electron'
import * as mm from 'music-metadata'
import { AudioData } from './AudioData'
import { AppIPCMain, AppIPCMessage } from './AppIPCMain'


function newFileFilter(name: string, exts: string[]): FileFilter {
    return {
        name: name,
        extensions: exts
    }
}

export class AppCommandsGenerator {
    private _app: App = null;
    private _win: BrowserWindow = null;
    private _ipcMg: AppIPCMain = null;
    public constructor(app: App, win: BrowserWindow, ipcMg: AppIPCMain) {
        this._app = app;
        this._win = win;
        this._ipcMg = ipcMg;
    }
    public OpenDialog_Load_Play(): void {
        dialog.showOpenDialog(this._win, {
            filters: [newFileFilter('Audio', ['flac', 'mp3']),],
            title: "Open Audio",
            properties: ["multiSelections"],
        }).then((result: { canceled: boolean, filePaths: string[] }) => {
            if (result.canceled) return;
            mm.parseFile(result.filePaths[0], { skipPostHeaders: true })
                .then((metadata: mm.IAudioMetadata) => {
                    let data = new AudioData(result.filePaths[0], metadata);
                    this._ipcMg.Send2Audio("Remote", "Current", data);
                })
                .catch((err) => {
                    console.error(err.message);
                });
            result.filePaths.forEach((path, idx) => {
                if (idx == 0) return;
                mm.parseFile(result.filePaths[idx], { skipPostHeaders: true })
                    .then((metadata: mm.IAudioMetadata) => {
                        let data = new AudioData(result.filePaths[idx], metadata);
                        this._ipcMg.Send2Audio("Add", "CurrentList", data);
                    })
                    .catch((err) => {
                        console.error(err.message);
                    });
            });
        }).catch((err) => {
            console.error(err.message);
        })
    }
}