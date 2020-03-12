import { ExWindow, GetParameters } from './ExWindow';
import ReactDOM from 'react-dom';
import React, { CSSProperties } from 'react';
import styled from 'styled-components';
import { RendererRouter } from './Utils';
import { AudioViewModel, LyricViewModel, ToastViewModel, ListViewModel } from './ViewModel';
import { ipcRenderer } from 'electron';
import { Message, Command } from '../shared/AppIpc';
import { AudioModel } from './Model';
import { App, Theme } from './View';

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

const audioModel = new AudioModel()

w.theme = new Theme()

w.audioVM = new AudioViewModel(w.router, audioModel)
w.router.registerHost(w.audioVM.mailBox)

w.lyricVM = new LyricViewModel()
w.router.registerHost(w.lyricVM.mailBox)

w.toastVM = new ToastViewModel()
w.router.registerHost(w.toastVM.mailBox)

w.listVM = new ListViewModel(audioModel)
w.router.registerHost(w.listVM.mailBox)


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
