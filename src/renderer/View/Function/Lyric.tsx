import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './Lyric.css'
import { useBind } from '../../Utils/ReactBindHook';
import { LyricDiv, LyricSpan } from '../../ViewModel/LyricViewModel';

export class LyricProps {
}

function cvtSpans(lrcSpans: LyricSpan[]) {
    return lrcSpans.map((v, i) => {
        if (v.type == "br")
            return <br key={`${i}`} />
        if (v.type == "span" && v.innerHtml) return (
            <span key={`${i}`} style={v.style}>
                {v.innerHtml}
            </span>
        )
        if (v.type == "ruby") return (
            <ruby key={`${i}`}>
                {cvtSpans(v.rubySpans)}
                <rp>(</rp><rt className="lyric ruby">{v.innerHtml}</rt><rp>)</rp>
            </ruby>
        )
    })
}

function GetLyricIdxFromSeek(lyriclines, seek) {
    for (let index = 0; index < lyriclines.length - 1; index++) {
        if (seek >= lyriclines[index].timeTag && seek < lyriclines[index + 1].timeTag) {
            return index;
        }
    }
    return -1
}


export const Lyric: React.FC<LyricProps> = (props) => {
    const height = useRef(0)
    const root = useRef(null as HTMLDivElement)
    const lastIdx = useRef(-1)
    const divs = useBind<LyricDiv[]>("lyricDivs", window["lyricVM"])
    const divRefs = !divs ? [] : divs.map((v, i) => null as HTMLDivElement)
    const seek = useBind<number>("seek", window["audioVM"])
    const top = useRef(0)
    useEffect(() => {
        function assignHeight() {
            if (root.current) {
                height.current = root.current.offsetHeight
            }
        }
        function assignTop() {
            let viewH = height.current
            let viewCY = viewH / 2
            if (!window["lyricVM"].lyric) {
                top.current = viewCY
                return
            }
            let nowIdx = GetLyricIdxFromSeek(window["lyricVM"].lyric.data, seek)
            if (nowIdx == -1) {
                top.current = viewCY
                return
            }
            if (lastIdx.current != nowIdx) {
                if (lastIdx.current != -1 && lastIdx.current < divRefs.length) divRefs[lastIdx.current].setAttribute("custome-highlighted", "false")
                if (nowIdx >= 0 && nowIdx < divRefs.length) divRefs[nowIdx].setAttribute("custome-highlighted", "true")
            }
            lastIdx.current = nowIdx
            let nowLyricTime = window["lyricVM"].lyric.data[nowIdx].timeTag
            let nowLyricH = divRefs[nowIdx].offsetHeight
            let nextLyricTime = Infinity
            if (nowIdx != window["lyricVM"].lyric.data.length - 1) {
                nextLyricTime = window["lyricVM"].lyric.data[nowIdx + 1].timeTag
            }
            let nowLyricDuration = nextLyricTime - nowLyricTime
            let passedH = divRefs[nowIdx].offsetTop
            let offsetH = nowLyricH * (seek - nowLyricTime) / nowLyricDuration
            top.current = viewCY - passedH - offsetH
        }
        assignHeight()
        assignTop()
        const handleResize = (ev) => {
            assignHeight()
            assignTop()
        }
        window.addEventListener("resize", handleResize)
        return () => {
            window.removeEventListener("resize", handleResize)
        }
    })

    const picture = useBind<string>("picture", window["audioVM"])
    return (
        <div className="lyric root" ref={root} >
            <style>
                {`
                    @keyframes lyric-moving-keyframe{
                        to{
                            top: ${Math.floor(top.current)}px
                        }
                    }
                `}
            </style>
            <img src={picture ? picture : "img/Ellipses.png"} className="waveForm" id="cover"></img>
            <div className="lyric moving-panel" style={{
                animationName:"lyric-moving-keyframe",
                animationDuration:"0.041s", animationTimingFunction:"linear",
                animationIterationCount:"1" , animationFillMode:"forwards"}}>
                {divs && divs.map((v, i) =>
                    <div key={`${i}`} id={`${i}`} style={v.style} ref={(ele) => divRefs[i] = ele} custome-highlighted="false"
                        className="lyric div">
                        {cvtSpans(v.spans)}
                    </div>
                )}
            </div>
        </div>
    )
}