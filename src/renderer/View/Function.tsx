import React from 'react';
import ReactDOM from 'react-dom';
import './Function.css'


export class FunctionProps {
    onClickFunction?: (idx: number) => void
}

export const Function: React.FC<FunctionProps> = (props) => {
    return (
        <div id="root" className="function container">
            <button className="function button" onClick={(ev) => { props.onClickFunction(0) }}>
                <i className="material-icons">image</i></button>
            <button className="function button" onClick={(ev) => { props.onClickFunction(1) }}>
                <i className="material-icons">show_chart</i></button>
            <button className="function button" onClick={(ev) => { props.onClickFunction(2) }}>
                <i className="material-icons">list</i></button>
            <button className="function button" onClick={(ev) => { props.onClickFunction(3) }}>
                <i className="material-icons">format_align_left</i></button>


        </div>
    )
}
