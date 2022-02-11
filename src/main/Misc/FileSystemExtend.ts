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
        try {
            const stat = await fs.promises.stat(dirPath)
            if (stat.isDirectory())
                resolve();
            else
                throw new Error("Path is existing file.")
        } catch (err) {
            try {
                await fs.promises.mkdir(dirPath, { recursive: true })
                resolve()
            } catch (err) {
                reject(err)
            }
        }
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
 * @param filePath 檔案路徑
 */
export function ensureFilePathAvailable(filePath: string) {
    return new Promise<void>(async (resolve, reject) => {
        try {
            const stat = await fs.promises.stat(filePath)
            if (stat.isFile())
                resolve();
            else
                throw new Error("Path is existing directory.")
        } catch (err) {
            try {
                await (await fs.promises.open(filePath, 'w')).close()
                resolve()
            } catch (err) {
                reject(err)
            }
        }
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
export function readFileLines(filePath: string, encoding: string|"auto" = "auto") {
    return new Promise<FileReadLinesResult>(async (resolve, reject) => {
        try {
            const buffer = await fs.promises.readFile(filePath)
            if (encoding == "auto") encoding = chardet.detect(buffer)
            const context = iconv.decode(buffer, encoding)
            let ret: string[] = [];
            if (context.length != 0) {
                ret = context.split("\n").map(v => v.trim())
            }
            resolve(<FileReadLinesResult>{
                encoding,
                lines: ret
            })
        } catch (err) {
            reject(err)
        }
    })
}