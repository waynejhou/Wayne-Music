import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import '../../resources/img/Ellipses.png'
import { useBind } from '../ViewModel';
import { DropDownToast } from './DropDownToast';
import { Toast, EToastIcon } from '../../shared/Toast';
import { Function, Player, ImageBackground, Switch, Theme, Dock } from '.'
import styled from "styled-components"
import { ExWindow } from '../ExWindow';
import { useStaticCSS } from '../Utils/ReactHook';
const Root = styled.div<{theme:Theme}>`
    display: grid;
    width: 100%;
    height: 100%;
    grid-template-columns: fit-content(99999px) 1fr;
    grid-template-rows: 1fr fit-content(99999px);
    font-family: 'Microsoft JhengHei';
    text-shadow: 2px 2px 3px ${Theme.var("--main-bg-color")};
    user-select: none;
    color: ${Theme.var("--main-fg-color")};
    background-color: ${Theme.var("--main-bg-color")};
    ${p=>p.theme.toString()}
`

const Left = styled(Dock)`
    grid-row: 1;
    grid-column: 1;
`
const Bottom = styled(Dock)`
    grid-row: 2;
    grid-column-start: 1;
    grid-column-end: 3;
`

const Center = styled(Dock)`
    grid-row: 1;
    grid-column: 2;
    max-height: 100%;
    overflow-y: hidden
`

export class AppProps {
    public title?: string
}

export const App: React.FC<AppProps> = (props) => {
    useStaticCSS("html_body",
`html, body {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    margin: 0;
    padding: 0;
    font-size: 10px;
}
.placehold{
    display: inherit;
    width: inherit;
    height: inherit;
    max-width: inherit;
    max-height: inherit;
}`)
    const w = window as ExWindow
    const picture = useBind<string>("picture", w.audioVM)
    const vaildPicture = picture ? picture : "img/Ellipses.png"
    document.title = `${useBind<string>("title", w.audioVM)} - Wayne Music`
    const [switchIdx, setSwitchIdx] = useState(2)
    return (
        <Root theme={w.theme} onContextMenu={(ev) => { w.toastVM.dropToast(new Toast(300, 5000, `Test Message ${Date.now()}`, EToastIcon.Loading)) }}>
            <Left>
                <Function onClickFunction={(idx) => { setSwitchIdx(idx) }}>
                </Function>
            </Left>
            <Bottom>
                <Player></Player>
            </Bottom>
            <Center>
                <ImageBackground src={vaildPicture}>
                </ImageBackground>
                <Switch idx={switchIdx}>
                </Switch>
                <DropDownToast></DropDownToast>
            </Center>
        </Root>
    )
}
