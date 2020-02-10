import React from 'react';
import ReactDOM from 'react-dom';
import './Player.css'
import * as AppDom from '../AppDom';
export class PlayerProps {


}
export const Player: React.FC<PlayerProps> = (props) => {
    return (
        <div id="root" className="player container">
            <div id="metadata" className="player">
                <div className="player metadata">
                    Title
                </div>
                <div className="player metadata">
                    Album
                </div>
            </div>
            <div id="control" className="player container">
                <div id="btns" className="player">
                    <button className="player button">
                        <i className="material-icons">play_arrow</i>
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
                        popup_hint_offsetX = "-10px"
                        valueToString={(v)=>`${Math.floor(v*100)}%`}
                    ></AppDom.Slider>
                </div>
                <AppDom.Slider
                    displayTag={true}
                    min={0}
                    max={300}
                    value={0}
                    step={0.01}
                    popup_hint_offsetX = "-30px"
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