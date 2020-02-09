import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './Slider.css'

export class SliderProps {
    id?: string
    displayTag?: boolean
    value?: number
    max?: number
    min?: number
    valueToString?: (v: number) => string
}

export const Slider: React.FC<SliderProps> = (props) => {
    const [mouseX, setMouseX] = useState(0);
    const [value, setValue] = useState(props.value);
    const [mouseValue, setMouseValue] = useState(0);
    const [max, setMax] = useState(props.max);
    const [min, setMin] = useState(props.min);
    function onChange() {

    }
    function onMouseMove(event: React.MouseEvent<HTMLInputElement, MouseEvent>) {
        const style =  window.getComputedStyle(event.currentTarget)
        const rect = event.currentTarget.getBoundingClientRect();
        const mouseOffsetX = event.clientX - rect.left
        const mouseValue = mouseOffsetX * (max - min) / parseFloat(style.getPropertyValue('width'))
        setMouseX(mouseOffsetX)
        setMouseValue(mouseValue)
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
                onChange={onChange}
                onMouseMove={onMouseMove}
            >
            </input>
            <div className="slider popup_hint"
                style={{ left: mouseX }}
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