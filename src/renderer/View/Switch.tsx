import React from 'react';
import ReactDOM from 'react-dom';
import { Cover, WaveForm, List, Lyric } from '.';
import styled from 'styled-components';


export class SwitchProps {
    idx?: number
}

const Root = styled.main`
display: grid;
grid-column: 1;
grid-row: 1;
z-index: 1;
max-height: -webkit-fill-available;
height: 100%
`;

export const Switch: React.FC<SwitchProps> = (props) => {
    const idx = (props.idx !== undefined ? props.idx : 0)
    return (
        <Root>
            {idx == 0 &&
                <Cover></Cover >
            }
            {idx == 1 &&
                <WaveForm></WaveForm>
            }
            {idx == 2 &&
                <List></List>
            }
            {idx == 3 &&
                <Lyric></Lyric>
            }
        </Root>
    )
}