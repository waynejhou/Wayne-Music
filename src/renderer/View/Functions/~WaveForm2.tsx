import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useBind } from '../../Utils/ReactBindHook';
import "./WaveForm.css"
import * as ArrayEx from '../../Utils/ArrayEx'

export class WaveFormProps {
}

const jet = new Array(256).fill(0).map((v,i)=>[i,128,255-i])
console.log(jet)

function getPathData(array: Array<number>, width: number, height: number, closed = false) {
    height = height - 20
    width = width - 20
    const min = Math.min(width, height)
    const loop = -(Date.now() % 20000) / 10000
    const funcs = array.map((v, i) => {
        return (a: number) => {
            a = -a
            return [
                Math.floor((a + min * 3 / 8) * Math.cos((Math.PI * i * 2) / (array.length + 10) - Math.PI * loop) + width / 2),
                Math.floor((a + min * 3 / 8) * Math.sin((Math.PI * i * 2) / (array.length + 10) - Math.PI * loop) + height / 2)
            ]
        }
    })
    const data = array.map(
        (v, idx) => {
            const [x, y] = funcs[idx](v)
            return `${x} ${y}`
        })
    const [sx, sy] = funcs[0](array[0])
    return `M ${sx} ${sy} L${data} Z`
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
    let sfeqData = useBind<Float32Array>("frequencyData", window["audioVM"])
    sfeqData = ArrayEx.sampling(sfeqData, 128)
    let feqData = Array.from(sfeqData).slice(0, sfeqData.length / 2)
    feqData.push(...Array.from(sfeqData).slice(0, sfeqData.length / 2))
    feqData.push(...Array.from(sfeqData).slice(0, sfeqData.length / 2))
    feqData.push(...Array.from(sfeqData).slice(0, sfeqData.length / 2))
    
    feqData = feqData.map((v, i, arr) => Math.floor(-v * 3 - 250))
    let sum = 0
    feqData.forEach(v=>sum+=v)
    let avg = sum/=feqData.length
    avg = Math.floor(1/(1+Math.exp(-avg))*128+128)
    avg = Math.min(Math.max(avg,0),255)
    console.log(avg)
    console.log(jet[avg])
    const [r,g,b] = jet[avg]
    console.log([r,g,b])
    const picture = useBind<string>("picture", window["audioVM"])
    return (
        <div id="root" ref={root} className="waveForm">
            <img src={picture ? picture : "img/Ellipses.png"} className="waveForm" id="cover"></img>
            <div className="waveForm" id="wave">
                <svg style={{ width: "100%", height: "100%", stroke: "var(--main-fg-color)" }}>
                    <defs>
                        <radialGradient id="fillG">
                            <stop offset="10%" stopColor="var(--main-layer-transparent)" />
                            <stop offset="95%" stopColor={`RGBA(${r},${g},${b}, 0.5)`} />
                        </radialGradient>
                    </defs>
                    <path fill={"url(#fillG)"} d={getPathData(feqData, width.current, height.current, true)}></path>
                </svg>
            </div>

        </div>
    )
}