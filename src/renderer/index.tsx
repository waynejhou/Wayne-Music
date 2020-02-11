import ReactDOM from 'react-dom';
import React from 'react';

import { RendererRouter } from './App/RendererRouter';
import { Message, Command } from '../shared/AppIpcMessage'
import * as AppIpc from './AppIpc'
import * as AppDom from './AppDom';
import './index.css'
import './index.theme.css'
import * as AppAudio from './AppAudio';

class GetParameters {
    public name: string;
    public constructor(getString: string) {
        const parameters = new URLSearchParams(location.search)
        this.name = parameters.get('name');
    }
}

type ExWindow = Window & typeof globalThis & {
    get: GetParameters
    router: AppIpc.RendererRouter
    audioPlayer: AppAudio.AudioPlayer
    audioPlayerController: AppAudio.AudioPlayerController
}
const w = (window as ExWindow)


w.get = new GetParameters(location.search)
w.router = new AppIpc.RendererRouter(w.get.name)

w.addEventListener('focus', (ev) => {
    console.log('window focued')
    AppIpc.RendererRouter.send2main(new Message('renderer', 'statusHost',
        new Command(
            'fire', "session-focus"
        )))
});


w.audioPlayer = new AppAudio.AudioPlayer()

w.router.registerHost(w.audioPlayer)

w.audioPlayerController = new AppAudio.AudioPlayerController(w.audioPlayer)

let onceRenderComplete = () => {
    RendererRouter.send2main(new Message('renderer', 'statusHost',
        new Command(
            'fire', "session-ready"
        )))
}

function render() {
    ReactDOM.render(
        <AppDom.App title={w.get.name} arEmitter={w.audioPlayer}></AppDom.App>,
        document.getElementById('main-placehold'),()=>{
            if(onceRenderComplete){
                onceRenderComplete()
                onceRenderComplete = undefined
            }
        }
    );
}
render()

