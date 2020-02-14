import React from 'react';
import ReactDOM from 'react-dom';
import './ImageBackground.css'

export class ImageBackgroundProps {
    src?: string
}

export const ImageBackground: React.FC<ImageBackgroundProps> = (props) => {
    return (
        <div id="root" className="imageBackground container" >
            <div id="wall" className="imageBackground" style={{
                backgroundImage: `url(${props.src})`
            }}></div>
            <div id="child" className="imageBackground">
                {props.children}
            </div>
        </div>
    )
}