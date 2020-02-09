import React from 'react';
import ReactDOM from 'react-dom';
import './Function.css'


export class FunctionProps {
}

export const Function: React.FC<FunctionProps> = (props) => {
    return (
        <div id="root" className="function container">
            <button className="function button">
                <i className="material-icons">image</i></button>
            <button className="function button">
                <i className="material-icons">list</i></button>
            <button className="function button">
                <i className="material-icons">format_align_left</i></button>
        </div>
    )
}
