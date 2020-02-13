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
    return (
        <div id="root" className="player container" >
            <div id="metadata" className="player">
                <div className="player metadata h1">
                    {useBind<string>("title", dataContext)}
                </div>
                <div className="player metadata h2">
                    {useBind<string>("album", dataContext)}
                </div>
            </div>
            <div id="control" className="player container">
                <div id="btns" className="player">
                    <button className="player button" onClick={() => { audioVM.ctrlPlayPause() }}>
                        <i className="material-icons">{useBind<string>("playback", dataContext)}</i>
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
                        value={useBind<number>("volume", dataContext)}
                        step={0.01}
                        popup_hint_offsetX="-10px"
                        valueToString={(v) => `${Math.floor(v * 100)}%`}
                        onChanged={(ev) => audioVM.volume = ev.currentTarget.valueAsNumber}
                    ></AppDom.Slider>
                </div>
                <AppDom.Slider
                    displayTag={true}
                    min={0}
                    max={useBind<number>("duration", dataContext)}
                    value={useBind<number>("seek", dataContext)}
                    step={0.05}
                    popup_hint_offsetX="-30px"
                    valueToString={(v) => {
                        let min = ("" + Math.floor(v / 60)).padStart(2, "0")
                        let sec = ("" + Math.floor(v % 60)).padStart(2, "0")
                        return `${min}:${sec}`
                    }}
                    onMouseUp={(ev) => { audioVM.seek = ev.currentTarget.valueAsNumber }}
                ></AppDom.Slider>
            </div>
        </div>
    )
}