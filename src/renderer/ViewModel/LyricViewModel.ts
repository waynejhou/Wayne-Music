import { BaseViewModel } from './BaseViewModel'
import { IHost, HostMailbox } from '../AppHost'
import { FontWeightProperty } from 'csstype'

const tagRegExp = /([^\]\[]+)?(?:(\[)(\/?)([^\\\/\:\]\[]*)(?:(\:)([^:\.\]\[]*))?(\]))?/gm;
export class LyricViewModel extends BaseViewModel implements IHost {
    public mailBox: HostMailbox
    constructor() {
        super()
        this.mailBox = new HostMailbox("lyric")
        this.mailBox.commandGot.do((sender, cmd) => {
            switch (cmd.action) {
                case 'update':
                    this.update(cmd.request, cmd.data)
                    break;
                default:
                    console.log(`Unrecognized Action [${cmd.action}]`)
                    break;
            }
        })
        this.lyric = (() => {
            const ret: { lyrics: string[], rawTimeTag: string, timeTag: number }[] = []
            const n = { lyrics: ["[ruby]Lyric File Not Found[/ruby:404 not found]"], rawTimeTag: "[00:00.00]", timeTag: 0 }
            const inf = { lyrics: [""], rawTimeTag: "Infinity", timeTag: <number><unknown>"Infinity" }
            ret.push(n)
            ret.push(inf)
            return { path: null, data: ret }
        })()
        this.updataLyric(this.lyric.data)
    }

    public update(req: string, data: any) {
        if (req == 'lyric') {
            this.lyric = data
            this.updataLyric(this.lyric.data)
            this.notifyPropChange("lyricDivs")
        }
    }

    private updataLyric(lyricLines: { lyrics: string[], rawTimeTag: string, timeTag: number }[]) {
        let color = null
        let bgcolor = null
        let fontweight = null
        let fontstyle = null
        let textdecoration = null
        let fontfamily = null
        function getSpanStyle(s: { c?: string, bgc?: string, fw?: string, fs?: string, td?: string, ff?: string }) {
            const { c, bgc, fw, td, ff, fs } = s
            let ret: React.CSSProperties = {}
            ret.fontWeight
            if (c) color = c;
            if (bgc) bgcolor = bgc;
            if (fw) fontweight = fw;
            if (fs) fontstyle = fs;
            if (td) textdecoration = td;
            if (ff) fontfamily = ff;
            if (null !== color) ret["color"] = color
            if (null !== bgcolor) ret["backgroundColor"] = bgcolor
            if (null !== fontweight) ret["fontWeight"] = fontweight as FontWeightProperty;
            if (null !== fontstyle) ret["fontStyle"] = fontstyle;
            if (null !== textdecoration) ret["textDecoration"] = textdecoration;
            if (null !== fontfamily) ret["fontFamily"] = fontfamily;
            return ret
        }
        const aliasDict: { [key: string]: string } = {}
        const divs = lyricLines.map(lyricline => {
            const ret = new LyricDiv()
            let queue = ret.spans
            function top() { return queue.length - 1 }
            queue.push(new LyricSpan())
            lyricline.lyrics.forEach(line => {
                for (let tagMatch = null as RegExpExecArray;
                    (tagMatch = tagRegExp.exec(line)) !== null;) {
                    if (tagMatch.index === tagRegExp.lastIndex) {
                        tagRegExp.lastIndex++;
                    }
                    if (tagMatch.input.trim().length == 0) continue
                    const fullMatch = tagMatch[0].trim()

                    const context = tagMatch[1]
                    if (!fullMatch) continue
                    if (context) {
                        queue[top()].innerHtml += context
                    }
                    const lbr = tagMatch[2]
                    if (!lbr) continue
                    const name = tagMatch[4] ? tagMatch[4].trim().toLowerCase() : null
                    const propVal = tagMatch[6] ? tagMatch[6].trim() : null;
                    if (name == "bg") {
                        ret.style.backgroundColor = propVal
                        continue
                    }
                    let value = 'inherit';
                    if (propVal) {
                        if (propVal in aliasDict) {
                            value = aliasDict[propVal]
                        } else {
                            value = propVal
                        }
                    }
                    queue.push(new LyricSpan())
                    if (name == "fg") {
                        queue[top()].style = getSpanStyle({ c: value })
                    } else if (name == "hg") {
                        queue[top()].style = getSpanStyle({ bgc: value })
                    } else if (name == "b") {
                        queue[top()].style = getSpanStyle({ fw: 'bold' })
                    } else if (name == "i") {
                        queue[top()].style = getSpanStyle({ fs: 'italic' })
                    } else if (name == "u") {
                        queue[top()].style = getSpanStyle({ td: 'underline' })
                    } else if (name == "d") {
                        queue[top()].style = getSpanStyle({ td: 'line-through' })
                    } else if (name == "font") {
                        queue[top()].style = getSpanStyle({ ff: value })
                    } else if (name == "ruby") {
                        const isCloseTag = tagMatch[3] == "/"
                        if (!isCloseTag) {
                            queue = [new LyricSpan()]
                        } else {
                            const newRuby = new LyricSpan("ruby")
                            newRuby.rubySpans = queue
                            ret.spans.push(newRuby)
                            queue = ret.spans
                            queue[top()].innerHtml = value
                            queue.push(new LyricSpan())
                        }
                    } else if (name == "lbr") {
                        queue[top()].innerHtml += '['
                    }
                    else if (name == "rbr") {
                        queue[top()].innerHtml += ']'
                    }
                    else if (name == "alias") {
                        const pair = value.split('=')
                        aliasDict[pair[0].trim()] = pair[1].trim()
                    }
                    else {
                        queue[top()].style[name] = value
                    }
                }
                queue.push(new LyricSpan("br"))
                queue.push(new LyricSpan())
            });
            return ret
        });
        this.lyricDivs = divs
    }

    public lyric: { path: string, data: { lyrics: string[], rawTimeTag: string, timeTag: number }[] }
    public lyricDivs: LyricDiv[]
}

export class LyricDiv {
    public style: React.CSSProperties
    public spans: LyricSpan[]
    public constructor() {
        this.style = {}
        this.spans = []
    }
}

export type LyricSpanType = "span" | "ruby" | "br"
export class LyricSpan {
    public type: LyricSpanType
    public style: React.CSSProperties
    public innerHtml: string
    public rubySpans: LyricSpan[]
    public constructor(type: LyricSpanType = "span") {
        this.type = type
        this.style = {}
        this.innerHtml = ""
        this.rubySpans = []
    }
}
