_: {
    if (!((typeof IsLyricRenderCalled) === 'undefined')) { break _ }
    IsLyricRenderCalled = true;
    let lyricElements = null;
    const tagRegExp = /([^\]\[]+)?(?:(\[)(\/?)([^\\\/\:\]\[]*)(?:(\:)([^:\.\]\[]*))?(\]))?/gm;

    let color = "inherit"
    const def_color = "inherit"
    let bgcolor = "inherit"
    const def_bgcolor = "inherit"
    let fontweight = "inherit"
    const def_fontweight = "inherit"
    let fontstyle = "inherit"
    const def_fontstyle = "inherit"
    let textdecoration = "inherit"
    const def_textdecoration = "inherit"
    let fontfamily = "inherit"
    const def_fontfamily = "inherit"

    getSpanStyle = (c = null, bgc = null, fw = null, fs = null, td = null, ff = null) => {
        let ret = `style="`
        if (c) color = c;
        if (bgc) def_bgcolor = bgc;
        if (fw) fontweight = fw;
        if (fs) fontstyle = fs;
        if (td) textdecoration = td;
        if (ff) fontfamily = ff;
        if (def_color != color) ret += `color: ${color};`
        if (def_bgcolor != bgcolor) ret += `background-color: ${bgcolor};`
        if (def_fontweight != fontweight) ret += `font-weight: ${fontweight};`
        if (def_fontstyle != fontstyle) ret += `font-style: ${fontstyle};`
        if (def_textdecoration != textdecoration) ret += `text-decoration: ${textdecoration};`
        if (def_fontfamily != fontfamily) ret += `font-family: ${fontfamily};`
        ret += `"`
        return ret
    }

    updateLyric = (lyric) => {
        $('#lyric-container').empty()
        lyricElements = null;
        $('#lyric-container').css({
            position: "relative",
            left: 0,
            top: 0
        })
        if (!lyric) return;
        let elements = lyric.map((lyricline, idx) => {
            let ret = `<div class="lyric-line" highlight="false" &&>`
            let divBG = "";
            lyricline.lyrics.forEach(line => {
                let tagMatch = null
                let isTagOpen = false;
                let isTagUncompleted = false;
                while ((tagMatch = tagRegExp.exec(line)) !== null) {
                    if (tagMatch.index === tagRegExp.lastIndex) {
                        tagRegExp.lastIndex++;
                    }
                    if (tagMatch.input.trim().length == 0) continue
                    if (tagMatch[0].trim().length == 0) continue
                    if (tagMatch[1] != undefined) {
                        ret += tagMatch[1]
                    }
                    if (tagMatch[2] == undefined) continue
                    if (isTagOpen) {
                        ret += `</span>`
                        isTagOpen = false
                    }
                    isTagOpen = true
                    if (tagMatch[4] == "bg") {
                        divBG = `style="background-color: ${tagMatch[6]};"`
                        continue
                    }
                    let name = tagMatch[4].toLowerCase();
                    let value = tagMatch[6];
                    if (value == undefined) value = 'inherit'
                    if (name == "fg") {
                        ret += `<span ${getSpanStyle(c = value)}>`
                    } else if (name == "hg") {
                        ret += `<span ${getSpanStyle(bgc = value)}>`
                    } else if (name == "b") {
                        ret += `<span ${getSpanStyle(fw = 'bold')}>`
                    } else if (name == "i") {
                        ret += `<span ${getSpanStyle(fs = 'italic')}>`
                    } else if (name == "u") {
                        ret += `<span ${getSpanStyle(td = 'underline')}>`
                    } else if (name == "d") {
                        ret += `<span ${getSpanStyle(td = 'line-through')}>`
                    } else if (name == "ruby") {
                        let isCloseTag = tagMatch[3] == "/"
                        if (!isCloseTag) {
                            ret += "<ruby>"
                        } else {
                            ret += `<rp>(</rp><rt>${value}</rt><rp>)</rp>`
                            ret += "</ruby>"
                        }
                    }
                    else {
                        ret += `<span style="${tagMatch[4]}: '${tagMatch[6]}'">`
                    }

                }
                if (isTagOpen) {
                    ret += `</span>`
                    isTagOpen = false
                }
                ret += `<br>`
            });
            ret += "</div>"
            ret = ret.replace(/&&/g, divBG)
            return $(ret);
        })
        lyricElements = elements
        $('#lyric-container').append(elements)
    }

    function GetLyricIdxFromSeek(lyriclines, seek) {
        for (let index = 0; index < lyriclines.length - 1; index++) {
            if (seek >= lyriclines[index].timeTag && seek < lyriclines[index + 1].timeTag) {
                return index;
            }
        }
        return -1
    }

    let lastIndex = -1;
    OnSeekChange.push((seek) => {
        if (!lyricElements) return;
        let nowIdx = GetLyricIdxFromSeek(Responds.Lyric, seek)
        if (nowIdx == -1) return
        let viewH = $('#lyric-wrapper').height()
        let viewCY = viewH / 2
        if (lastIndex != nowIdx) {
            if (lastIndex != -1 && lastIndex < lyricElements.length) lyricElements[lastIndex].attr("highlight", () => { return false })
            if (nowIdx < lyricElements.length) lyricElements[nowIdx].attr("highlight", () => { return true })
        }
        lastIndex = nowIdx
        let nowLyricTime = Responds.Lyric[nowIdx].timeTag
        let nowLyricH = lyricElements[nowIdx].outerHeight()
        let nextLyricTime = Infinity
        if (nowIdx != Responds.Lyric.length - 1) {
            nextLyricTime = Responds.Lyric[nowIdx + 1].timeTag
        }
        let nowLyricDuration = nextLyricTime - nowLyricTime
        let passedH = lyricElements[nowIdx].position().top
        let offsetH = nowLyricH * (seek - nowLyricTime) / nowLyricDuration
        /*$('#lyric-container').animate(
            {
                top: `${viewCY - passedH - offsetH}px`
            }, 100 
        )*/
        $('#lyric-container').css({
            "top": `${viewCY - passedH - offsetH}px`
        })
    })

    if (!OnResponds.Lyric) {
        OnResponds.Lyric = (lyric) => {
            updateLyric(lyric)
        }
    }

    OnBodyChanged.lyric = () => {
        if (Responds["Current"]) {
            updateCoverBackground(Responds.Current.picture)
            updateCoverBottomright(Responds.Current.picture)
        }
        updateLyric(Responds.Lyric)
    }


}