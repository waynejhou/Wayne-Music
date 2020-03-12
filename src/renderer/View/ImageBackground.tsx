import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

export class ImageBackgroundProps {
    src?: string
}

const Root = styled.div`
display: grid;
opacity: 0.5 ;
background-position: center;
filter: blur(25px);
grid-column: 1;
grid-row: 1;
z-index: 0;
background-size: 80%;
background-repeat: no-repeat;
`;

export const ImageBackground: React.FC<ImageBackgroundProps> = (props) => {
    return (
        <Root style={{
            backgroundImage: `url(${props.src})`
        }}>
        </Root>
    )
}