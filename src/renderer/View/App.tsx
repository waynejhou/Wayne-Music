import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useEffect } from "react";
import '../../resources/img/Ellipses.png'
import * as AppView from '../AppView';
import "./App.css"
import { AudioViewModel } from '../AppViewModel';
import { useBind } from '../Utils/ReactBindHook';
import { ImageBackground } from './ImageBackground';
import { DropDownToast } from './DropDownToast';
import { Toast } from '../../shared/Toast';

export class AppProps {
    public title?: string
}

export const App: React.FC<AppProps> = (props) => {
    const w = window as Window & typeof globalThis & { audioVM: AudioViewModel }
    const picture = useBind<string>("picture", window["audioVM"])
    document.title = `${useBind<string>("title", window["audioVM"])} - Wayne Music`
    const [switchIdx, setSwitchIdx] = useState(2)
    return (
        <div id='root' className='app' onContextMenu={(ev)=>{window["toastVM"].dropToast(new Toast(300,5000, `Test Message ${Date.now()}`))}}>
            <div id="left" className="app dock">
                <AppView.Function onClickFunction={(idx) => { setSwitchIdx(idx) }}>
                </AppView.Function>
            </div>
            <div id="bottom" className="app dock">
                <AppView.Player dataContext={w.audioVM}></AppView.Player>
            </div>
            <div id="app-center" className="app dock">
                <ImageBackground src={picture ? picture : "img/Ellipses.png"}>
                </ImageBackground>
                <AppView.Switch idx={switchIdx}>
                </AppView.Switch>
                <DropDownToast></DropDownToast>
            </div>
        </div >
    )
}
