import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import * as MathEx from "../Misc/MathEx"
import './Slider.css'

export class SliderProps {
    id?: string
    displayTag?: boolean
    value?: number
    max?: number
    min?: number
    step?: number
    popup_hint_offsetX?: number | string
    valueToString?: (v: number) => string
}

export const Slider: React.FC<SliderProps> = (props) => {
    const [mouseX, setMouseX] = useState(0);
    const [value, setValue] = useState(props.value);
    const [mouseValue, setMouseValue] = useState(0);
    const [max, setMax] = useState(props.max);
    const [min, setMin] = useState(props.min);
    function onChange(event: React.ChangeEvent<HTMLInputElement>) {
        setValue(event.currentTarget.valueAsNumber)
    }
    function onMouseMove(event: React.MouseEvent<HTMLInputElement, MouseEvent>) {
        const style = window.getComputedStyle(event.currentTarget)
        const rect = event.currentTarget.getBoundingClientRect();
        const mouseOffsetX = event.clientX - rect.left
        const mouseValue = mouseOffsetX * (max - min) / parseFloat(style.getPropertyValue('width'))
        setMouseX(MathEx.limitToRange(mouseOffsetX, 0, rect.width))
        setMouseValue(MathEx.limitToRange(mouseValue, min, max))
    }
    function onClick() {
        console.log("clicked")
    }

    return (
        <div id="root" className="slider">
            {props.displayTag &&
                <div className="slider tag">
                    {props.valueToString ?
                        props.valueToString(value) :
                        value}
                </div>
            }
            <input type="range" className="slider"
                min={min} max={max} value={value}
                step={props.step}
                onChange={onChange}
                onMouseMove={onMouseMove}
                onClick={onClick}
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
                        props.valueToString(max) :
                        max}
                </div>
            }
        </div>
    )
}