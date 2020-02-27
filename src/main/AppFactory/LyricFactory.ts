import * as path from 'path'
import * as fs from 'fs';
import * as fsex from '../Misc/FileSystemExtend'

const timeTagRegExp = /(\[)([0-9]+)(\:)([0-9]+)(\.)?([0-9]*)(\])/gm;

const Pow10Cache = new Array<number>(20).fill(null);

function CachedPow10(exp: number): number {
    if (!Pow10Cache[exp]) Pow10Cache[exp] = Math.pow(10, exp)
    return Pow10Cache[exp];
}

function escapeHTML(s: string) {
    return s.replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export class LyricLine {
    public rawTimeTag: string = null;
    public timeTag: number = null;
    public lyrics: string[] = [];
    public constructor(timeTagString: string, totalSec: number) {
        this.rawTimeTag = timeTagString
        this.timeTag = totalSec
    }
}

function ParseLyricLine(rawLine: string, outLyricLineList: LyricLine[]): void {
    if (!outLyricLineList) throw Error('');
    let timeTagMatch: RegExpExecArray, timeTags: any[] = [], totalSec: number
    while ((timeTagMatch = timeTagRegExp.exec(rawLine)) !== null) {
        if (timeTagMatch.index === timeTagRegExp.lastIndex) {
            timeTagRegExp.lastIndex++;
        }
        let min = parseInt(timeTagMatch[2])
        let sec = parseInt(timeTagMatch[4])
        let msec = parseInt(timeTagMatch[6])
        totalSec = min * 60 + sec + (msec / CachedPow10(msec.toString().length))
        timeTags.push({ raw: timeTagMatch[0], totalSec: totalSec })
    }
    let deTimeTagLine = rawLine.replace(timeTagRegExp, "")

    timeTags.forEach(tag => {
        let idx = outLyricLineList.findIndex((line) => { return line.rawTimeTag == tag.raw })
        if (idx != -1) {
            outLyricLineList[idx].lyrics.push(deTimeTagLine)
        } else {
            let newLine = new LyricLine(tag.raw, tag.totalSec)
            newLine.lyrics.push(deTimeTagLine)
            outLyricLineList.push(newLine)
        }
    });

}


export class LyricParser {
    public static GuessLyricPaths(audioPath: string): string[] {
        let dir = path.dirname(audioPath);
        let ext = path.extname(audioPath);
        let file = path.basename(audioPath, ext)
        return [path.join(dir, `${file}.lrc`)];
    }
    public static async Parse(lyricPath: string) {
        let lines = new Array<LyricLine>();
        try {
            let raws = await fsex.readFileLines(lyricPath)
            console.log(raws.encoding)
            raws.lines.forEach((rawLine, i) => {
                ParseLyricLine(rawLine, lines)
            })
            lines.sort((a, b) => { return a.timeTag - b.timeTag })
            lines.push(new LyricLine("Infinity", <number><unknown>"Infinity"))
        } catch (err) {
            console.log(err)
        }
        return lines
    }
    public static NotFound = (() => {
        let ret: LyricLine[] = []
        let n = new LyricLine("[00:00.00]", 0)
        n.lyrics = ["Lyric File Not Found"]
        ret.push(n)
        ret.push(new LyricLine("Infinity", <number><unknown>"Infinity"))
        return ret
    })()

}



export class LyricFactory {
    public async loadAudioLyric(filePath: string) {
        let lyricPaths = LyricParser.GuessLyricPaths(filePath);
        let lyricPath = null;
        for (let index = 0; index < lyricPaths.length; index++) {
            const path = lyricPaths[index];
            try {
                await fs.promises.access(path)
                lyricPath = path
                break;
            } catch (err) {
                continue
            }
        }
        if (lyricPath) {
            const data = await LyricParser.Parse(lyricPath)
            return { path: lyricPath as string, data: data }
        } else {
            return { path: null as string, data: LyricParser.NotFound }
        }
    }
}