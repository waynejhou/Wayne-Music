import * as path from 'path'
import * as Fs from 'fs';

const timeTagRegExp = /(\[)([0-9]+)(\:)([0-9]+)(\.)?([0-9]*)(\])/gm;

const Pow10Cache = new Array<number>(20).fill(null);

function CachedPow10(exp:number):number{
    if(!Pow10Cache[exp]) Pow10Cache[exp] = Math.pow(10,exp)
    return Pow10Cache[exp];
}

function escapeHTML(s:string) { 
    return s.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}

export class LyricLine {
    public rawTimeTag:string = null;
    public timeTag:number = null;
    public lyrics:string[] = [];
    public constructor(timeTagString:string, totalSec:number){
        this.rawTimeTag = timeTagString
        this.timeTag = totalSec
    }
}

function ParseLyricLine(rawLine:string, outLyricLineList:LyricLine[]): void{
    if(!outLyricLineList) throw Error('');
    let timeTagMatch:RegExpExecArray, timeTags:any[] = [], totalSec:number
    while ((timeTagMatch = timeTagRegExp.exec(rawLine)) !== null) {
        if (timeTagMatch.index === timeTagRegExp.lastIndex) {
            timeTagRegExp.lastIndex++;
        }
        let min = parseInt(timeTagMatch[2])
        let sec = parseInt(timeTagMatch[4])
        let msec = parseInt(timeTagMatch[6])
        totalSec = min*60+sec+(msec/CachedPow10(msec.toString().length))
        timeTags.push({raw:timeTagMatch[0], totalSec:totalSec})
    }
    let deTimeTagLine = escapeHTML(rawLine.replace(timeTagRegExp,""))

    timeTags.forEach(tag => {
        let idx = outLyricLineList.findIndex((line)=>{return line.rawTimeTag==tag.raw})
        if(idx!=-1){
            outLyricLineList[idx].lyrics.push(deTimeTagLine)
        }else{
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
    public static Parse(lyricPath: string): LyricLine[] {
        let lines = new Array<LyricLine>();
        let raw = Fs.readFileSync(lyricPath).toString()
        raw.split("\n").forEach((rawLine, i)=>{
            ParseLyricLine(rawLine, lines)
        })
        lines.sort((a,b)=>{return a.timeTag-b.timeTag})
        return lines
    }

}

export default {
    LyricParser, LyricLine
}