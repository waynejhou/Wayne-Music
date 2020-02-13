import React from 'react';
import ReactDOM from 'react-dom';
import { useEffect } from "react";
import '../../resources/material-design-icons-3.0.1/iconfont/material-icons.css'
import '../../resources/img/Ellipses.png'
import * as AppView from '../AppView';
import "./App.css"
import { AudioViewModel } from '../AppViewModel';
import { useBind } from '../Utils/ReactBindHook';

export class AppProps {
    public title?: string
}

export const App: React.FC<AppProps> = (props) => {
    const w = window as Window & typeof globalThis & { audioVM: AudioViewModel }
    document.title = `${useBind<string>("title", window["audioVM"])} - Wayne Music`
    return (
        <div id='root' className='app'>
            <div id="left" className="app dock">
                <AppView.Function></AppView.Function>
            </div>
            <div id="bottom" className="app dock">
                <AppView.Player dataContext={w.audioVM}></AppView.Player>
            </div>
            <div id="app-center" className="app dock">
                <div style={{ display: "grid"}}>
                    <img src={useBind<string>("picture", window["audioVM"])}></img>
                </div>
            </div>
        </div>
    )
}
