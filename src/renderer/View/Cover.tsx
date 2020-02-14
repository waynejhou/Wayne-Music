import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './Cover.css'
import { FunctionProps } from './Function';
import * as MathEx from '../Utils/MathEx'

export class CoverProps {
    src?: string
    wavedata?: Float32Array
}

function getPathData(array: Array<number>, width: number, height: number) {
    const data = array.map(
        (v, idx) => {
            return `${(idx + 1) * (width / array.length)} ${v + height / 2}`
        })
    return `M0 ${array[0] + height / 2} S${data} L ${width} ${height} 0 ${height} Z`
}

export const Cover: React.FC<CoverProps> = (props) => {
    const width = useRef(0)
    const height = useRef(0)
    const root = useRef(null)
    const array = [50, 50, 40, 30]
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
    return (
        <div id="root" className="cover" >
            <img src={props.src} className="cover"></img>
            <div id="wave" ref={root} className="cover">
                <svg className="cover"
                    style={{ width: "100%", height: "100%", fill: "var(--main-layer-transparent)" }}>
                    <path d={getPathData(Array.from(props.wavedata), width.current, height.current)}></path>
                </svg>
            </div>
        </div>
    )
}