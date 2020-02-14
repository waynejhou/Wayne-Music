import { BrowserWindow, dialog, FileFilter } from "electron"
import * as mm from 'music-metadata'
import * as path from 'path'
import * as fs from 'fs'
import * as crypto from 'crypto';
import * as sharp from 'sharp'

import * as App from "../App"
import * as fsx from "../Misc/FileSystemExtend"
import { Audio } from "../../shared/Audio"

class CoverCacheList {
    [fileHash: string]: string
}


const coverCacheDirName = path.join("www", "cover_path")
export class AudioFactory {

    public constructor(info: App.Info, cmdArgs: App.CommandLineArgs) {
        this.initCacheFunction(info, cmdArgs)
    }

    private coverCachePath: string = null;
    private coverCacheListFilePath: string = null
    private coverCacheListFiles: CoverCacheList = null
    private coverCachePathPrefix: string = null;
    private async initCacheFunction(info: App.Info, cmdArgs: App.CommandLineArgs) {
        this.coverCachePath = path.join(info.exePath, coverCacheDirName);
        try {
            await fsx.ensureDirPathAvailable(this.coverCachePath)
        } catch (err) {
            console.log(`Can't not create Caver Cache Path`);
            throw err
        }

        this.coverCacheListFilePath = path.join(this.coverCachePath, "list.csv")
        try {
            await fsx.ensureFilePathAvailable(this.coverCacheListFilePath)
        } catch (err) {
            console.log(`Can't not create Cover Cache List File`);
            throw err
        }

        try {
            let lines = (await (fsx.readFileLines(this.coverCacheListFilePath))).lines
            this.coverCacheListFiles = {}
            for (let index = 0; index < lines.length; index++) {
                let spltstr = lines[index].split(',').map(v => v.trim())
                this.coverCacheListFiles[spltstr[0]] = spltstr[1]
            }
        } catch (err) {
            console.log(`Can't not read Cover Cache List File`);
            throw err
        }

        this.coverCachePathPrefix = path.join(info.exePath, coverCacheDirName)
    }

    public openAudioDialog(win: BrowserWindow = null) {
        return dialog.showOpenDialog(win, {
            filters: <FileFilter[]>[{
                name: 'Audio',
                extensions: ['flac', 'mp3'],
            }],
            title: "Open Audio",
            properties: ["multiSelections"],
        })
    }

    public getFileUid(fp: string) {
        return new Promise<string>(async (resolve, reject) => {
            let stat: fs.Stats = null;
            try {
                stat = await fs.promises.stat(fp)
            } catch (error) {
                reject(error);
                return
            }
            const uid = crypto.createHash('sha512').update(`${fp}-${stat.mtimeMs}`).digest('hex')
            resolve(uid)
        })
    }

    public generateCache(uid: string, metadata: mm.IAudioMetadata) {
        return new Promise<string>(async (resolve, reject) => {
            const alreadyCached = uid in this.coverCacheListFiles
            if (alreadyCached) {
                resolve(path.join(this.coverCachePathPrefix, `${this.coverCacheListFiles[uid]}.png`));
                return;
            }

            if (!(metadata.common.picture && metadata.common.picture.length > 0)) {
                reject(new Error("Audio Metadata has no picture."));
                return;
            }

            try {
                const pic = metadata.common.picture[0]
                const picInfo = await sharp(pic.data).metadata()
                const data: Buffer = await this.formatCoverData(picInfo, pic.data)
                const imgHash = crypto.createHash('sha512').update(data).digest('hex')
                const cachePath = path.join(this.coverCachePath, `${imgHash}.png`)
                await sharp(data).toFile(cachePath)
                await fs.promises.appendFile(this.coverCacheListFilePath, `${uid}, ${imgHash}\n`)
                this.coverCacheListFiles[uid] = imgHash
                resolve(path.join(this.coverCachePathPrefix, `${this.coverCacheListFiles[uid]}.png`));
            } catch (err) {
                reject(err)
                return
            }
        })
    }

    public formatCoverData(info: sharp.Metadata, data: Buffer) {
        return new Promise<Buffer>(async (resolve, reject) => {
            try {
                if (info.width > 500 || info.height > 500) {
                    const ret = await sharp(data).resize(500, 500, { fit: "inside" })
                        .png().toBuffer()
                    resolve(ret)
                } else {
                    const ret = await sharp(data)
                        .png().toBuffer()
                    resolve(ret)
                }
            } catch (err) {
                reject(err)
                return
            }
        })
    }

    public loadAudiosByPaths(filePaths: string[]) {
        return Promise.all(filePaths.map((fp) => this.loadAudioByPath(fp)))
    }

    public async loadAudioByPath(fp: string) {

        let uid: string = null;
        let metadata: mm.IAudioMetadata = null
        try {
            uid = await this.getFileUid(fp)
            const alreadyCached = uid in this.coverCacheListFiles
            const parseOptions: mm.IOptions = {
                duration: false,
                skipCovers: alreadyCached,
                skipPostHeaders: true
            }
            metadata = await mm.parseFile(fp, parseOptions)
        } catch (err) {
            console.log(err)
            return new Audio(fp)
        }

        let coverPath: string = null;
        try {
            coverPath = await this.generateCache(uid, metadata)
        } catch (err) {
            console.log(err)
            return new Audio(fp, metadata)
        }
        return new Audio(fp, metadata, coverPath)
    }

    public async openDialog_loadAudio(win: BrowserWindow = null) {
        return new Promise<Audio[]>(async (resolve, reject) => {
            try {
                const result = await this.openAudioDialog(win)
                if (result.canceled) {
                    reject("Dialog Canceled");
                    return;
                }
                const audios = await this.loadAudiosByPaths(result.filePaths)
                resolve(audios)
            } catch (error) {
                console.log(error)
                return
            }
        })

    }
}