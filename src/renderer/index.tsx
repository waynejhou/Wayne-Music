import ReactDOM from 'react-dom';
import React from 'react';

import { RendererRouter } from './Utils/RendererRouter';
import { Message, Command } from '../shared/AppIpcMessage'
import * as AppIpc from './AppIpc'
import { App } from './AppView';
import './index.css'
import './index.theme.css'
import { AudioModel } from './AppAudio';
import { ipcRenderer } from 'electron';
import { AudioViewModel } from './AppViewModel';

class GetParameters {
    public name: string;
    public constructor(getString: string) {
        const parameters = new URLSearchParams(location.search)
        this.name = parameters.get('name');
    }
}

type ExWindow = Window & typeof globalThis & {
    get: GetParameters
    router: RendererRouter
    audio: AudioModel
    audioVM: AudioViewModel
}
const w = (window as ExWindow)


w.get = new GetParameters(location.search)
w.router = new RendererRouter(w.get.name, ipcRenderer)

w.addEventListener('focus', (ev) => {
    console.log('window focued')
    RendererRouter.send2main(new Message('renderer', 'statusHost',
        new Command(
            'invoke', "sessionFocus"
        )))
});


w.audio = new AudioModel()
w.audioVM = new AudioViewModel(w.audio)
w.router.registerHost(w.audioVM.mailBox)

let onceRenderComplete = () => {
    RendererRouter.send2main(new Message('renderer', 'statusHost',
        new Command(
            'invoke', "sessionReady"
        )))
}

function render() {
    ReactDOM.render(
        <App title={w.get.name}></App>,
        document.getElementById('main-placehold'), () => {
            if (onceRenderComplete) {
                onceRenderComplete()
                onceRenderComplete = undefined
            }
        }
    );
}
render()

