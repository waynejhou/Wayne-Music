import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useBind } from '../../ViewModel';
import * as ArrayEx from '../../Utils/ArrayEx'
import styled from 'styled-components';
import {Theme} from '..'
import { ExWindow } from '../../ExWindow';

const Root = styled.div`
grid-row: 1;
grid-column: 1;
display: grid;
overflow: hidden;
padding: 10px;
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

const Wave = styled.div`
grid-row: 1;
grid-column: 1;
z-index: 1;
`

export class WaveFormProps {
}

function getPathData(array: Array<number>, width: number, height: number, closed = false) {
    height = height - 20
    width = width - 20
    const barWid = width/array.length/2
    const center = height / 2
    const data = array.map(
        (v, idx) => {
            return `${(idx + 1) * (width / array.length)-barWid} ${v + center} ${(idx + 1) * (width / array.length)+barWid} ${v + center}`
        })
    return `M0 ${array[0] + center} L${data} ` + `${closed ? `L ${width} ${height} 0 ${height} Z` : ``}`
}

export const WaveForm: React.FC<WaveFormProps> = (props) => {
    const w = window as ExWindow
    const width = useRef(0)
    const height = useRef(0)
    const root = useRef(null)
    useEffect(() => {
        if (root.current) {
            width.current = root.current.offsetWidth
            height.current = root.current.offsetHeight
        }
        const handleResize = (ev) => {
            if (root.current) {
                width.current = root.current.offsetWidth
                height.current = root.current.offsetHeight
            }
        }
        window.addEventListener("resize", handleResize)
        return () => {
            window.removeEventListener("resize", handleResize)
        }
    })
    /*
    const timeData = Array.from(props.timeDomainData).map(v=>Math.floor(v*500))
    const feqData = Array.from(props.frequencyData).map(v=>Math.floor(-v*3-300))
    */
    const sfeqData = useBind<Float32Array>("frequencyData",w.audioVM)
    const feqData = Array.from( ArrayEx.sampling(sfeqData, 32)).map(v => Math.floor(-v * 4 - 400))
    const picture = useBind<string>("picture", w.audioVM)
    const vaildPicture = picture ? picture : "img/Ellipses.png"
    return (
        <Root ref={root}>
            <Cover src={vaildPicture}></Cover>
            <Wave>
                <svg style={{ width: "100%", height: "100%", stroke: Theme.var("--main-fg-color"), fill: Theme.var("--main-layer-color")}}>
                    <path d={getPathData(feqData, width.current, height.current, true)}></path>
                </svg>
            </Wave>
        </Root>
    )
}