import React, { useState, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Player.css'
import * as AppDom from '../AppDom';
import * as AppAudio from '../AppAudio';
import { BaseProps } from '../BaseProps';
export class PlayerProps extends BaseProps {

}
export const Player: React.FC<PlayerProps> = (props) => {
    const w = window as Window & typeof globalThis & { audioPlayerController: AppAudio.AudioPlayerController }
    const [[title, album], setMetadata] = useState(["title", "album"])
    const [playback, setPlayback] = useState("play_arrow")
    useEffect(() => {
        const id1 = props.arEmitter.on("updated", "current", (data: AppAudio.Audio) => {
            setMetadata([data.title, data.album])
        })
        const id2 = props.arEmitter.on("updated", "playback", (data: AppAudio.EPlayback) => {
            if (data == AppAudio.EPlayback.playing) {
                setPlayback("pause")
            } else {
                setPlayback("play_arrow")
            }
        })
        return () => {
            props.arEmitter.remove("updated", "current", id1)
            props.arEmitter.remove("updated", "playback", id2)
        }
    })
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
                    <button className="player button" onClick={() => { w.audioPlayerController.ctrl_PlayPause() }}>
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
                        value={0.5}
                        step={0.01}
                        popup_hint_offsetX="-10px"
                        valueToString={(v) => `${Math.floor(v * 100)}%`}
                    ></AppDom.Slider>
                </div>
                <AppDom.Slider
                    displayTag={true}
                    min={0}
                    max={300}
                    value={0}
                    step={0.01}
                    popup_hint_offsetX="-30px"
                    valueToString={(v) => {
                        let min = ("" + Math.floor(v / 60)).padStart(2, "0")
                        let sec = ("" + Math.floor(v % 60)).padStart(2, "0")
                        return `${min}:${sec}`
                    }}
                ></AppDom.Slider>
            </div>
        </div>
    )
}