import * as fs from 'fs'
import * as chardet from 'chardet'
import * as iconv from 'iconv-lite';

/**
 * 確保資料夾路徑可用
 * 
 * 若存在   => 不做事
 * 
 * 若不存在 => 創建一個
 * 
 * @param dirPath 資料夾路徑
 */
export function ensureDirPathAvailable(dirPath: string) {
    return new Promise<void>(async (resolve, reject) => {
        let asyncFailed = false
        let stat = <fs.Stats>await fs.promises.stat(dirPath).catch((err) => { asyncFailed = true })
        if (asyncFailed == false && stat.isDirectory()) { resolve(); return } // 路徑存在，且是資料夾
        await fs.promises.mkdir(dirPath, { recursive: true })// 製作資料夾
            .then(() => {
                resolve()
            })
            .catch((err) => {
                reject(err)
            })
        return
    })
}

/**
 * 確保檔案路徑可用
 * 
 * 若存在   => 不做事
 * 
 * 若不存在 => 創建一個
 * 
 * @param dirPath 資料夾路徑
 */
export function ensureFilePathAvailable(filePath: string) {
    return new Promise(async (resolve, reject) => {
        let asyncFailed = false
        let stat = <fs.Stats>await fs.promises.stat(filePath).catch((err) => { asyncFailed = true })
        if (asyncFailed == false && stat.isFile()) { resolve(); return } // 路徑存在，且是檔案
        let pfh = <fs.promises.FileHandle>await fs.promises.open(filePath, 'w').catch((err) => { reject(err); asyncFailed = true })
        if (asyncFailed) return
        await pfh.close().catch((err) => { reject(err); asyncFailed = true })
        if (asyncFailed) return
        return
    })
}

/**
 * `readFileLines(filePath: string, encoding: string = "auto")`的執行結果
 */
export class FileReadLinesResult {
    encoding: string
    lines: string[]
}

/**
 * 讀取文字檔案所有文字行（去掉換行）
 * @param filePath 文字檔案路徑
 * @param encoding 編碼（預設為`"auto"`：自動偵測）
 */
export function readFileLines(filePath: string, encoding: string = "auto") {
    return new Promise<FileReadLinesResult>((resolve, reject) => {
        fs.promises.readFile(filePath)
            .then((buffer) => {
                if (encoding == "auto") encoding = chardet.detect(buffer)
                let context = iconv.decode(buffer, encoding)
                let ret: string[] = [];
                if (context.length != 0) {
                    ret = context.split("\n").map(v => v.trim())
                }
                resolve(<FileReadLinesResult>{
                    encoding,
                    lines: ret
                })
            }).catch((err) => {
                reject(err)
            })
    })
}