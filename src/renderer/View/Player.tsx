import React, { useState, useCallback, useEffect, useRef, ReactHTMLElement } from 'react';
import ReactDOM from 'react-dom';
import './Player.css'
import * as AppDom from '../AppView';
import * as AppAudio from '../AppAudio';
import { AudioViewModel } from '../AppViewModel';
import { BaseViewModel } from '../ViewModel/BaseViewModel';
import { useBind } from '../Utils/ReactBindHook';
import * as Icon from './Icon/Icons'
import { EPlayback, ERepeat, ERandom } from '../../shared/Audio';
export class PlayerProps {
    dataContext: BaseViewModel
}
export const Player: React.FC<PlayerProps> = (props) => {
    const { dataContext } = props
    const audioVM = dataContext as AudioViewModel
    const title = useBind<string>("title", dataContext)

    const titleRef = useRef(null as HTMLDivElement)
    const albumRef = useRef(null as HTMLDivElement)
    const metadatRef = useRef(null as HTMLDivElement)
    const titleWidth = useRef(0)
    const titleSpeed = useRef(0)
    const titleShouldScroll = useRef(false)
    const album = useBind<string>("album", dataContext)
    const albumWidth = useRef(0)
    const albumSpeed = useRef(0)
    const albumShouldScroll = useRef(false)
    useEffect(() => {
        if (Math.abs(titleWidth.current - Math.floor(titleRef.current.clientWidth)) > 1)
            titleWidth.current = Math.floor(titleRef.current.clientWidth)
        titleSpeed.current = Math.floor(titleWidth.current * 0.03)
        titleShouldScroll.current = metadatRef.current.clientWidth - titleRef.current.clientWidth < 0
        if (Math.abs(albumWidth.current - Math.floor(albumRef.current.clientWidth)) > 1)
            albumWidth.current = Math.floor(albumRef.current.clientWidth)
        albumSpeed.current = Math.floor(albumWidth.current * 0.03)
        albumShouldScroll.current = metadatRef.current.clientWidth - albumRef.current.clientWidth < 0
    })
    return (
        <div id="root" className="player container" >
            <div id="metadata" className="player" ref={metadatRef}>
                <div className="player metadata title">
                    <style>
                        {`@keyframes title-movingKeyframe1{
                            0% {
                                left: 0px
                            }
                            10% {
                                left: 0px
                            }
                            100% {
                                left: -${titleWidth.current}px;
                            }
                        }
                        @keyframes title-movingKeyframe2{
                            0% {
                                left: ${titleWidth.current}px;
                            }
                            10% {
                                left: ${titleWidth.current}px;
                            }
                            100% {
                                left: 0px
                            }
                        }`}
                    </style>
                    <div className="title-moving1 player metadata" ref={titleRef} style={{
                        animation: titleShouldScroll.current ? `title-movingKeyframe1 ${titleSpeed.current}s linear infinite` : "none"
                    }}>
                        {title}
                    </div>
                    <div className="title-moving2 player metadata" style={{
                        animation: titleShouldScroll.current ? `title-movingKeyframe2 ${titleSpeed.current}s linear infinite` : "none"
                    }}>
                        {title}
                    </div>
                </div>
                <div className="player metadata album">
                    <style>
                        {`@keyframes album-movingKeyframe1{
                            0% {
                                left: 0px
                            }
                            10% {
                                left: 0px
                            }
                            100% {
                                left: -${albumWidth.current}px;
                            }
                        }
                        @keyframes album-movingKeyframe2{
                            0% {
                                left: ${albumWidth.current}px;
                            }
                            10% {
                                left: ${albumWidth.current}px;
                            }
                            100% {
                                left: 0px
                            }
                        }`}
                    </style>
                    <div className="album-moving1 player metadata" ref={albumRef} style={{
                        animation: albumShouldScroll.current ? `album-movingKeyframe1 ${albumSpeed.current}s linear infinite` : "none"
                    }}>
                        {album}
                    </div>
                    <div className="album-moving2 player metadata" style={{
                        animation: albumShouldScroll.current ? `album-movingKeyframe2 ${albumSpeed.current}s linear infinite` : "none"
                    }}>
                        {album}
                    </div>
                </div>
            </div>
            <div id="control" className="player container">
                <div id="btns" className="player">
                    <button className="player button" onClick={() => { audioVM.ctrlPlayPause() }}>
                        {useBind<EPlayback>("playback", dataContext) == EPlayback.playing &&
                            <Icon.Pause className="button-icon player"></Icon.Pause>
                        }
                        {useBind<EPlayback>("playback", dataContext) == EPlayback.paused &&
                            <Icon.Playing className="button-icon player"></Icon.Playing>
                        }
                        {useBind<EPlayback>("playback", dataContext) == EPlayback.stopped &&
                            <Icon.Playing className="button-icon player"></Icon.Playing>
                        }
                    </button>
                    <button className="player button">
                        <Icon.StepForward className="button-icon player"></Icon.StepForward>
                    </button>
                    <button className="player button">
                        <Icon.StepBackward className="button-icon player"></Icon.StepBackward>
                    </button>
                    <button className="player button" onClick={(ev)=>{audioVM.ctrlRandom()}}>
                        {useBind<ERandom>("random", dataContext) == ERandom.on &&
                            <Icon.Random className="button-icon player"></Icon.Random>
                        }
                        {useBind<ERandom>("random", dataContext) == ERandom.off &&
                            <Icon.Random className="button-icon player" data-enable="false"></Icon.Random>
                        }
                    </button>
                    <button className="player button" onClick={(ev)=>{audioVM.ctrlRepeat()}}>
                        {useBind<ERepeat>("repeat", dataContext) == ERepeat.off &&
                            <Icon.RepeatOff className="button-icon player"></Icon.RepeatOff>
                        }
                        {useBind<ERepeat>("repeat", dataContext) == ERepeat.current &&
                            <Icon.RepeatCurrent className="button-icon player"></Icon.RepeatCurrent>
                        }
                        {useBind<ERepeat>("repeat", dataContext) == ERepeat.list &&
                            <Icon.RepeatList className="button-icon player"></Icon.RepeatList>
                        }
                    </button>
                    <AppDom.Slider
                        displayTag={true}
                        min={0}
                        max={1}
                        value={useBind<number>("volume", dataContext)}
                        step={0.01}
                        popup_hint_offsetX="-10px"
                        valueToString={(v) => `${Math.floor(v * 100)}%`}
                        onChanged={(ev) => audioVM.volume = ev.currentTarget.valueAsNumber}
                        onWheel={(ev) => audioVM.volume = ev.currentTarget.valueAsNumber}
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