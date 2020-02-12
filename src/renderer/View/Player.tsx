import React, { useState, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Player.css'
import * as AppDom from '../AppView';
import * as AppAudio from '../AppAudio';
import { AudioViewModel } from '../AppViewModel';
import { BaseViewModel } from '../ViewModel/BaseViewModel';
import { useBind } from '../Utils/ReactBindHook';
export class PlayerProps {
    dataContext: BaseViewModel
}
export const Player: React.FC<PlayerProps> = (props) => {
    const { dataContext } = props
    const audioVM = dataContext as AudioViewModel
    
    const playback = useBind<string>("playback", dataContext)
    const title = useBind<string>("title", dataContext)
    const album = useBind<string>("album", dataContext)
    const volume = useBind<number>("volume", dataContext)
    const seek = useBind<number>("seek", dataContext)
    return (
        <div id="root" className="player container" >
            <div id="metadata" className="player">
                <div className="player metadata">
                    {title}
                </div>
                <div className="player metadata">
                    {album}
                </div>
            </div>
            <div id="control" className="player container">
                <div id="btns" className="player">
                    <button className="player button" onClick={() => { audioVM.ctrlPlayPause() }}>
                        <i className="material-icons">{playback}</i>
                    </button>
                    <button className="player button">
                        <i className="material-icons">fast_rewind</i>
                    </button>
                    <button className="player button">
                        <i className="material-icons">fast_forward</i>
                    </button>
                    <button className="player button">
                        <i className="material-icons">transform</i>
                    </button>
                    <button className="player button">
                        <i className="material-icons">repeat</i>
                    </button>
                    <AppDom.Slider
                        min={0}
                        max={1}
                        value={volume}
                        step={0.01}
                        popup_hint_offsetX="-10px"
                        valueToString={(v) => `${Math.floor(v * 100)}%`}
                        onChanged={(ev) => audioVM.volume = ev.currentTarget.valueAsNumber}
                    ></AppDom.Slider>
                </div>
                <AppDom.Slider
                    displayTag={true}
                    min={0}
                    max={300}
                    value={seek}
                    step={0.01}
                    popup_hint_offsetX="-30px"
                    valueToString={(v) => {
                        let min = ("" + Math.floor(v / 60)).padStart(2, "0")
                        let sec = ("" + Math.floor(v % 60)).padStart(2, "0")
                        return `${min}:${sec}`
                    }}
                    onChanged={(ev) => audioVM.seek = ev.currentTarget.valueAsNumber}
                ></AppDom.Slider>
            </div>
        </div>
    )
}