import React from 'react';
import ReactDOM from 'react-dom';
import './ImageBackground.css'

export class ImageBackgroundProps {
    src?: string
}

export const ImageBackground: React.FC<ImageBackgroundProps> = (props) => {
    return (
        <div id="root" className="imageBackground" style={{
            backgroundImage: `url(${props.src})`
        }}>
        </div>
    )
}