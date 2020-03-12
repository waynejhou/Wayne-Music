import React, { } from 'react';
import ReactDOM from 'react-dom';
import { useBind } from '../../ViewModel';
import styled from 'styled-components';
import { Container } from '../Theme';
import { ExWindow } from '../../ExWindow';

export class CoverProps {
}

const Root = styled(Container)`
display: grid
`;

const CoverImg = styled.img`
grid-row: 1;
grid-column: 1;
margin: auto;
max-width: 500px;
background-color: var(--main-layer-transparent);
outline: thick solid var(--main-layer-transparent-d);
`;

export const Cover: React.FC<CoverProps> = (props) => {
    const w = window as ExWindow
    const picture = useBind<string>("picture", w.audioVM)
    const vaildPicture = picture ? picture : "img/Ellipses.png"
    return (
        <Root>
            <CoverImg src={vaildPicture}></CoverImg>
        </Root>
    )
}