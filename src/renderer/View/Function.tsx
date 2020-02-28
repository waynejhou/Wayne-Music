import React from 'react';
import ReactDOM from 'react-dom';
import './Function.css'
import * as Icon from "./Icon/Icons"


export class FunctionProps {
    onClickFunction?: (idx: number) => void
}

export const Function: React.FC<FunctionProps> = (props) => {
    return (
        <div id="root" className="function container">
            <button className="function button" onClick={(ev) => { props.onClickFunction(0) }}>
                <Icon.Cover className="button-icon function"></Icon.Cover></button>
            <button className="function button" onClick={(ev) => { props.onClickFunction(1) }}>
                <Icon.WaveForm className="button-icon function"></Icon.WaveForm></button>
            <button className="function button" onClick={(ev) => { props.onClickFunction(2) }}>
                <Icon.List className="button-icon function"></Icon.List></button>
            <button className="function button" onClick={(ev) => { props.onClickFunction(3) }}>
                <Icon.Lyric className="button-icon function"></Icon.Lyric></button>
        </div>
    )
}
