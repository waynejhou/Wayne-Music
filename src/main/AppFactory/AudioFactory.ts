import * as path from 'path'
import * as fsx from '../Misc/FileSystemExtend'

class CoverCacheList {
    [fileHash: string]: string
}

export class AudioFactory{
    

    private coverCachePath: string = null;
    private coverCacheListFilePath: string = null
    private coverCacheListFiles: CoverCacheList = null
    public constructor(exePath:){
        
    }

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
}