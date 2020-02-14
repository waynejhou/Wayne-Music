import React from 'react';
import ReactDOM from 'react-dom';
import './Switch.css'

export class SwitchProps {
    idx?: number
}

export const Switch: React.FC<SwitchProps> = (props) => {
    const childrenCount = React.Children.count(props.children)
    const idx = (childrenCount > 0 ? (props.idx ? props.idx : 0) : -1)
    return (
        <div id="root" className="switch">
            {idx != -1 &&
                React.Children.map(props.children, (child, i) => i === idx ? child: null)
            }
        </div>
    )
}