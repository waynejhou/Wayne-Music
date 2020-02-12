import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import * as MathEx from "../Utils/MathEx"
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
    onChanged?: (event: React.ChangeEvent<HTMLInputElement>) => void
    onMouseUp?: (event: React.MouseEvent<HTMLInputElement>) => void
}

export const Slider: React.FC<SliderProps> = (props) => {
    const [mouseX, setMouseX] = useState(0);
    const [mouseValue, setMouseValue] = useState(0);

    function onMouseMove(event: React.MouseEvent<HTMLInputElement, MouseEvent>) {
        const style = window.getComputedStyle(event.currentTarget)
        const rect = event.currentTarget.getBoundingClientRect();
        const mouseOffsetX = event.clientX - rect.left
        const mouseValue = mouseOffsetX * (props.max - props.min) / parseFloat(style.getPropertyValue('width'))
        setMouseX(MathEx.limitToRange(mouseOffsetX, 0, rect.width))
        setMouseValue(MathEx.limitToRange(mouseValue, props.min, props.max))
    }
    function onClick() {
        console.log("clicked")
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
                min={props.min} max={props.max} value={props.value}
                step={props.step}
                onChange={(ev) => { if (props.onChanged) props.onChanged(ev); }}
                onMouseMove={onMouseMove}
                onMouseUp={(ev) => { if (props.onMouseUp) props.onMouseUp(ev); }}
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
                        props.valueToString(props.max) :
                        props.max}
                </div>
            }
        </div>
    )
}