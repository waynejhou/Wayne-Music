import ReactDOM from 'react-dom';
import React from 'react';
import { AppIpc } from '../shared/Data';
import { ipcRenderer, IpcRenderer } from 'electron'
import { AppIpcRenderer } from './AppIpcRenderer'
import './index.css'
import { App } from './App';

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


function render(){
    ReactDOM.render(
        <App title={get.name} render={this}></App>,
        document.getElementById('main-placehold')
    );
}
render()