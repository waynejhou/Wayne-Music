import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useBind } from '../../Utils/ReactBindHook';
import "./WaveForm.css"
import * as ArrayEx from '../../Utils/ArrayEx'

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
    const sfeqData = useBind<Float32Array>("frequencyData", window["audioVM"])
    const feqData = Array.from( ArrayEx.sampling(sfeqData, 32)).map(v => Math.floor(-v * 4 - 400))
    const picture = useBind<string>("picture", window["audioVM"])
    return (
        <div id="root" ref={root} className="waveForm">
            <img src={picture ? picture : "img/Ellipses.png"} className="waveForm" id="cover"></img>
            <div className="waveForm" id="wave">
                <svg style={{ width: "100%", height: "100%", stroke: "var(--main-fg-color)", fill: "var(--main-layer-transparent)" }}>
                    <path d={getPathData(feqData, width.current, height.current, true)}></path>
                </svg>
            </div>

        </div>
    )
}