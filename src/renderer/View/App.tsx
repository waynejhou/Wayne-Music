import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useEffect } from "react";
import '../../resources/material-design-icons-3.0.1/iconfont/material-icons.css'
import '../../resources/img/Ellipses.png'
import * as AppView from '../AppView';
import "./App.css"
import { AudioViewModel } from '../AppViewModel';
import { useBind } from '../Utils/ReactBindHook';
import { ImageBackground } from './ImageBackground';

export class AppProps {
    public title?: string
}

export const App: React.FC<AppProps> = (props) => {
    const w = window as Window & typeof globalThis & { audioVM: AudioViewModel }
    const picture = useBind<string>("picture", window["audioVM"])
    document.title = `${useBind<string>("title", window["audioVM"])} - Wayne Music`
    const [switchIdx, setSwitchIdx] = useState(0)
    return (
        <div id='root' className='app'>
            <div id="left" className="app dock">
                <AppView.Function onClickFunction={(idx) => { setSwitchIdx(idx) }}>
                </AppView.Function>
            </div>
            <div id="bottom" className="app dock">
                <AppView.Player dataContext={w.audioVM}></AppView.Player>
            </div>
            <div id="app-center" className="app dock">
                <ImageBackground src={picture ? picture : "img/Ellipses.png"}>
                    <AppView.Switch idx={switchIdx}>
                        <AppView.Cover
                            src={picture ? picture : "img/Ellipses.png"}
                            wavedata={useBind<Float32Array>("timeDomainData", window["audioVM"])}
                        ></AppView.Cover>
                        <div>asd</div>
                    </AppView.Switch>
                </ImageBackground>
            </div>
        </div >
    )
}
