import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';

import * as MathEx from "../../Utils/MathEx"
import './Slider.css'
import { globalShortcut } from 'electron';

export class SliderProps {
    id?: string
    displayTag?: boolean
    value?: number
    max?: number
    min?: number
    step?: number
    popup_hint_offsetX?: number | string
    valueToString?: (v: number) => string
    onChanged?: (event: React.ChangeEvent<HTMLInputElement>) => void
    onMouseUp?: (event: React.MouseEvent<HTMLInputElement>) => void
    onWheel?: (event: React.MouseEvent<HTMLInputElement>) => void
}

const slider_left_color = "var(--main-layer-transparent-d)"
const slider_right_color = "var(--main-layer-transparent)"
const slider_left_color_hover = "var(--main-layer-transparent-hover-d)"

export const Slider: React.FC<SliderProps> = (props) => {
    /** 滑鼠座標  設定 popup hint 的位置 */
    const [mouseX, setMouseX] = useState(0);
    /** 滑鼠數值  設定 popup hint 的預覽數值 */
    const [mouseValue, setMouseValue] = useState(0);
    /**
     * 確定是「內部變更(滑鼠拖動)」抑或是「外部變更(prop變動)」。
     * 使用 ref 的目的是不要促發多餘的 rerender。
     * 目的是為了達到「不拖動時才實際改變數值」。
     */
    const interChange = useRef(false)
    /** 「內部變更(滑鼠拖動)」用的 state */
    const [value, setValue] = useState(0);

    const isHover = useRef(false)
    function onMouseMove(event: React.MouseEvent<HTMLInputElement, MouseEvent>) {
        const style = window.getComputedStyle(event.currentTarget)
        const rect = event.currentTarget.getBoundingClientRect();
        const mouseOffsetX = event.clientX - rect.left
        const mouseValue = mouseOffsetX * (props.max - props.min) / parseFloat(style.getPropertyValue('width'))
        setMouseX(MathEx.limitToRange(mouseOffsetX, 0, rect.width))
        setMouseValue(MathEx.limitToRange(mouseValue, props.min, props.max))
    }

    return (
        <div id="root" className="slider">
            {props.displayTag &&
                <div className="slider tag">
                    {props.valueToString ?
                        props.valueToString(props.value) :
                        props.value}
                </div>
            }
            <input type="range" className="slider"
                min={props.min} max={props.max} value={interChange.current ? value : props.value}
                step={props.step}
                onMouseDown={(ev) => { interChange.current = true; }}
                onChange={(ev) => { if (interChange) setValue(ev.currentTarget.valueAsNumber); if (props.onChanged) props.onChanged(ev); }}
                onMouseMove={onMouseMove}
                onMouseUp={(ev) => { interChange.current = false; if (props.onMouseUp) props.onMouseUp(ev); }}
                onMouseEnter={(ev) => { isHover.current = true }}
                onMouseLeave={(ev) => { isHover.current = false }}
                onWheel={(ev) => { ev.currentTarget.valueAsNumber += (ev.deltaX / 5000 - ev.deltaY / 5000); if (props.onWheel) props.onWheel(ev); }}
                style={isHover.current ? {
                    background:
                        `linear-gradient(` +
                        `to right, ` +
                        `${slider_left_color_hover}, ` +
                        `${slider_left_color_hover} ${(interChange.current ? value : props.value) * 100 / props.max - 0.5}%, ` +
                        `${slider_right_color} ${(interChange.current ? value : props.value) * 100 / props.max + 0.5}%, ` +
                        `${slider_right_color})`
                } : {
                        background:
                            `linear-gradient(` +
                            `to right, ` +
                            `${slider_left_color}, ` +
                            `${slider_left_color} ${(interChange.current ? value : props.value) * 100 / props.max - 0.5}%, ` +
                            `${slider_right_color} ${(interChange.current ? value : props.value) * 100 / props.max + 0.5}%, ` +
                            `${slider_right_color})`
                    }}
            >
            </input>
            <div className="slider popup_hint"
                style={{ left: mouseX, top: props.popup_hint_offsetX }}
            >
                {props.valueToString ?
                    props.valueToString(mouseValue) :
                    mouseValue}
            </div>
            {props.displayTag &&
                <div className="slider tag">
                    {props.valueToString ?
                        props.valueToString(props.max) :
                        props.max}
                </div>
            }
        </div>
    )
}