import React from 'react';
import ReactDOM from 'react-dom';
import { useEffect } from "react";
import '../../resources/material-design-icons-3.0.1/iconfont/material-icons.css'
import * as AppDom from '../AppDom';
import "./App.css"

export class AppProps {
    public title?: string
}

export const App: React.FC<AppProps> = (props) => {
    useEffect(() => {
        document.title = props.title;
    });
    return (
        <div id='root' className='app'>
            <div id="left" className="app dock">
                <AppDom.Function></AppDom.Function>
            </div>
            <div id="bottom" className="app dock">
                <AppDom.Player></AppDom.Player>
            </div>
            <div id="app-center" className="app dock">
            </div>
        </div>
    )
}
