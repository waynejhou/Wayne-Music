import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';

import * as MathEx from "../../Utils/MathEx"
import styled from 'styled-components';
import { Theme } from '..';
//import './Slider.css'

export class SliderProps {
    displayTag?: boolean
    value: number
    max: number
    min: number
    step: number
    popupY: number | string
    valueToString?: (v: number) => string
    onChanged?: (event: React.ChangeEvent<HTMLInputElement>) => void
    onMouseUp?: (event: React.MouseEvent<HTMLInputElement>) => void
    onWheel?: (event: React.MouseEvent<HTMLInputElement>) => void
}

const Root = styled.div`
display: grid;
grid-template-columns: fit-content(10px) 1fr fit-content(10px);
position: relative;
`

const SliderSideText = styled.div`
font-size: 1.2rem;
width: 50px;
margin-top: auto;
margin-bottom: auto;
`


const SliderInput = styled.input.attrs(p => ({ type: 'range' }))`
-webkit-appearance: none;
outline: none;
background: ${Theme.var("--main-layer-color")};
height: 10px;
margin-top: auto;
margin-bottom: auto;
margin-left:10px;
margin-right:10px;
border: transparent;
border-style: solid;
border-width: 1px;
overflow: hidden;
&::-webkit-slider-runnable-track{
    -webkit-appearance: none;
}

&::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 0px;
    height: 15px;
    box-shadow: -99999px 0 0 99999px ${Theme.var("--main-layer-color-more")};
}
&:hover::-webkit-slider-thumb {
    box-shadow: -99999px 0 0 99999px ${Theme.var("--main-layer-color-more--hover")};
}
&:focus {
    outline: none;
    border: ${Theme.var("--main-layer-color")};
    border-width: 1px;
    border-style: dashed;
}
`

const SliderPopup = styled.div`
position: absolute;
z-index: 1;
opacity: 0;
background-color: ${Theme.var("--main-layer-color")};
padding: 5px;
font-size: 1.2rem;
input[type=range]:hover + &{
    opacity: 1;
}
`
/*
background: linear-gradient(to right, 
    ${Theme.var("--main-layer-color-more")}, 
    ${Theme.var("--main-layer-color-more")} ${p => (p.value as number) * 100 / (p.max as number) - 0.5}%, 
    ${Theme.var("--main-layer-color")} ${p => (p.value as number) * 100 / (p.max as number)+ 0.5}%, 
    ${Theme.var("--main-layer-color")});
&:hover{
    background: linear-gradient(to right, 
        ${Theme.var("--main-layer-color-more--hover")}, 
        ${Theme.var("--main-layer-color-more--hover")} ${p => (p.value as number) * 100 / (p.max as number) - 0.5}%, 
        ${Theme.var("--main-layer-color")} ${p => (p.value as number) * 100 / (p.max as number) + 0.5}%, 
        ${Theme.var("--main-layer-color")});
}
*/
export const Slider: React.FC<SliderProps> = (props) => {
    /** 滑鼠座標  設定 popup hint 的位置 */
    const [mouseX, setMouseX] = useState(0);
    /** 滑鼠數值  設定 popup hint 的預覽數值 */
    const [mouseValue, setMouseValue] = useState(0);

    const propValue = props.value

    /**
     * 確定是「內部變更(滑鼠拖動)」抑或是「外部變更(prop變動)」。
     * 使用 ref 的目的是不要促發多餘的 rerender。
     * 目的是為了達到「不拖動時才實際改變數值」。
     */
    const isInterChange = useRef(false)

    /** 「內部變更(滑鼠拖動)」用的 state */
    const [interValue, setInterValue] = useState(0);

    const displayValue = (isInterChange.current ? interValue : propValue).toFixed(2)

    function vaildValueString(value: number) {
        return props.valueToString ? props.valueToString(value) : value
    }

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
        <Root>
            {props.displayTag &&
                <SliderSideText style={{textAlign:"right"}}>
                    {vaildValueString(propValue)}
                </SliderSideText>
            }
            <SliderInput type='range'
                min={props.min} max={props.max} value={displayValue}
                step={props.step}
                onMouseDown={(ev) => { isInterChange.current = true; }}
                onChange={(ev) => { if (isInterChange) setInterValue(ev.currentTarget.valueAsNumber); if (props.onChanged) props.onChanged(ev); }}
                onMouseMove={onMouseMove}
                onMouseUp={(ev) => { isInterChange.current = false; if (props.onMouseUp) props.onMouseUp(ev); }}
                onMouseEnter={(ev) => { isHover.current = true }}
                onMouseLeave={(ev) => { isHover.current = false }}
                onWheel={(ev) => { ev.currentTarget.valueAsNumber += (ev.deltaX / 5000 - ev.deltaY / 5000); if (props.onWheel) props.onWheel(ev); }}
            >
            </SliderInput>
            <SliderPopup style={{left: mouseX, top: props.popupY}}>
                {vaildValueString(mouseValue)}
            </SliderPopup>
            {props.displayTag &&
                <SliderSideText>
                    {vaildValueString(props.max)}
                </SliderSideText>
            }
        </Root>
    )
}