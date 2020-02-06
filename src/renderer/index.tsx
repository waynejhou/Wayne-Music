import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import { AppIpc } from '../shared/Data';
import { ipcRenderer, IpcRenderer } from 'electron'
import { AppIpcRenderer } from './AppIpcRenderer'
import './index.css'

class GetParameters {
    public name: string;
    public constructor(getString: string) {
        const parameters = new URLSearchParams(location.search)
        this.name = parameters.get('name');
    }
}
const get = new GetParameters(location.search)

const ipc = new AppIpcRenderer(get.name)
window.addEventListener('focus', (ev) => {
    console.log('window focued')
    AppIpcRenderer.send2main(new AppIpc.Message('renderer', 'sessCenter', new AppIpc.Command(
        'focus', get.name
    )))
});

ipc.onGotMessageFrom("cmdCenter", "update", (req, data)=>{
    console.log(req)
    console.log(data)
})

class AppProps {
    public render: ()=>{};
}
const App: React.FC<AppProps> = (props) => {
    return (
        <div id='root' className='app'>
            {get.name}
        </div>
    )
}

function render(){
    ReactDOM.render(
        <App render={this}></App>,
        document.getElementById('main-placehold')
    );
}
render()