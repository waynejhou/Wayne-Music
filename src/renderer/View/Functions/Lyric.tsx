import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useBind } from '../../ViewModel';
import { LyricDiv, LyricSpan } from '../../ViewModel/LyricViewModel';
import styled from 'styled-components';
import {Theme, Container} from '..'
import { ExWindow } from '../../ExWindow';
const w = window as ExWindow
const Root = styled(Container)`
display: grid;
grid-column: 1;
grid-row: 1;
overflow: hidden;
padding: 10px;
position: relative;
`

const MovingPanel = styled.div`
display: flex;
flex-direction: column;
grid-column: 1;
grid-row: 1;
height: 0px;
position: absolute;
top: 0px;
`

const LyricStyle = styled.div`
font-size: 2.0rem;
opacity: 0.2;
transition: opacity 0.5s;
padding-bottom: 1.5rem;
&[data-highlighted=true]{
    font-size: 2.0rem;
    opacity: 1;
    padding-bottom: 1.5rem;
}
`

const Cover = styled.img`
grid-row: 1;
grid-column: 1;
z-index: 0;
max-width: 350px;
margin-left: auto;
margin-top: auto;
opacity: 0.5;
background-color: ${Theme.var("--main-layer-color")};
outline: thick solid ${Theme.var("--main-layer-color-more")};
`

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
    const divs = useBind<LyricDiv[]>("lyricDivs", w.lyricVM)
    const divRefs = !divs ? [] : divs.map((v, i) => null as HTMLDivElement)
    const seek = useBind<number>("seek", w.audioVM)
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
            if (!w.lyricVM.lyric) {
                top.current = viewCY
                return
            }
            let nowIdx = GetLyricIdxFromSeek(w.lyricVM.lyric.data, seek)
            if (nowIdx == -1) {
                top.current = viewCY
                return
            }
            if (lastIdx.current != nowIdx) {
                if (lastIdx.current != -1 && lastIdx.current < divRefs.length) divRefs[lastIdx.current].setAttribute("data-highlighted", "false")
                if (nowIdx >= 0 && nowIdx < divRefs.length) divRefs[nowIdx].setAttribute("data-highlighted", "true")
            }
            lastIdx.current = nowIdx
            let nowLyricTime = w.lyricVM.lyric.data[nowIdx].timeTag
            let nowLyricH = divRefs[nowIdx].offsetHeight
            let nextLyricTime = Infinity
            if (nowIdx != w.lyricVM.lyric.data.length - 1) {
                nextLyricTime = w.lyricVM.lyric.data[nowIdx + 1].timeTag
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

    const picture = useBind<string>("picture", w.audioVM)
    const vaildPicture = picture ? picture : "img/Ellipses.png"
    return (
        <Root ref={root} >
            <style>
                {`
                    @keyframes lyric-moving-keyframe{
                        to{
                            top: ${Math.floor(top.current)}px
                        }
                    }
                `}
            </style>
            <Cover src={vaildPicture}></Cover>
            <MovingPanel style={{
                animationName:"lyric-moving-keyframe",
                animationDuration:"0.041s", animationTimingFunction:"linear",
                animationIterationCount:"1" , animationFillMode:"forwards"}}>
                {divs && divs.map((v, i) =>
                    <LyricStyle key={`${i}`} id={`${i}`} style={v.style} ref={(ele) => divRefs[i] = ele} data-highlighted="false">
                        {cvtSpans(v.spans)}
                    </LyricStyle>
                )}
            </MovingPanel>
        </Root>
    )
}