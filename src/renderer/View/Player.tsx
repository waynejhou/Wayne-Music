import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { AudioViewModel, ListViewModel, useBind } from '../ViewModel';
import { EPlayback, ERandom, ERepeat } from '../../shared/Audio';
import * as Icon from "./Icon/Icons"
import { Slider } from '.';
import styled, { keyframes } from 'styled-components';
import { Container, Theme } from './Theme';
import { useDomAttr } from '../Utils/ReactHook';
import { ScrollingText } from './Util/ScrollingText';
import { ExWindow } from '../ExWindow';

export class PlayerProps {
}

const Root = styled(Container)`
display: grid;
grid-template-columns: 1fr 2fr;
`

const Metadata = styled.div`
grid-column: 1;
display: grid;
`

const Control = styled.div`
grid-column: 2;
display: grid;
`

const Buttons = styled.div`
display: flex;
flex-direction: row;
`

const Button = styled.button`
background-color: ${Theme.var("--main-layer-color")};
border: none;
margin: 5px;
border-radius: 5px;
width: 50px;
height: 50px;
font-size: 3rem;
display: grid;

&:hover {
    border: none;
    background-color: ${Theme.var("--main-layer-color--hover")};
}
&:disabled {
    background-color: ${Theme.var("--main-layer-color")};
}
&:disabled:active {
    background-color: ${Theme.var("--main-layer-color")};
}
&:active {
    background-color: ${Theme.var("--main-active-color")};
}

&:focus {
    outline: none;
    border: white;
    border-width: 1px;
    border-style: dashed;
}

& > .player.button-icon{
    margin: auto;
    fill: ${Theme.var("--main-fg-color")};
}
&:disabled > .player.button-icon{
    fill: ${Theme.var("--main-layer-color")};
}
& > .player.button-icon[data-enable="false"]{
    margin: auto;
    fill: ${Theme.var("--main-layer-color-more")}
}
`

const Title = styled(ScrollingText)`
    font-size: 3rem;
`
const Album = styled(ScrollingText)`
    font-size: 2rem;
`

export const Player: React.FC<PlayerProps> = (props) => {
    const w = window as ExWindow
    const titleText = useBind<string>("title", w.audioVM)
    const albumText = useBind<string>("album", w.audioVM)
    const playback = useBind<EPlayback>("playback", w.audioVM)
    const random = useBind<ERandom>("random", w.listVM)
    const repeat = useBind<ERepeat>("repeat", w.listVM)
    return (
        <Root>
            <Metadata>
                <Title>
                    {titleText}
                </Title>
                <Album >
                    {albumText}
                </Album>
            </Metadata>
            <Control>
                <Buttons>
                    <Button onClick={() => { w.audioVM.ctrlPlayPause() }}>
                        {playback == EPlayback.playing &&
                            <Icon.Pause className="button-icon player"></Icon.Pause>
                        }
                        {playback == EPlayback.paused &&
                            <Icon.Playing className="button-icon player"></Icon.Playing>
                        }
                        {playback == EPlayback.stopped &&
                            <Icon.Playing className="button-icon player"></Icon.Playing>
                        }
                    </Button>
                    <Button disabled={!useBind("canGetLast", w.listVM)} onClick={(ev) => { w.listVM.toLast() }}>
                        <Icon.StepBackward className="button-icon player" ></Icon.StepBackward>
                    </Button>
                    <Button disabled={!useBind("canGetNext", w.listVM)} onClick={(ev) => { w.listVM.toNext() }}>
                        <Icon.StepForward className="button-icon player"></Icon.StepForward>
                    </Button>
                    <Button onClick={(ev) => { w.listVM.ctrlRandom() }}>
                        {random == ERandom.on &&
                            <Icon.Random className="button-icon player"></Icon.Random>
                        }
                        {random == ERandom.off &&
                            <Icon.Random className="button-icon player" data-enable="false"></Icon.Random>
                        }
                    </Button>
                    <Button onClick={(ev) => { w.listVM.ctrlRepeat() }}>
                        {repeat == ERepeat.off &&
                            <Icon.RepeatOff className="button-icon player"></Icon.RepeatOff>
                        }
                        {repeat == ERepeat.current &&
                            <Icon.RepeatCurrent className="button-icon player"></Icon.RepeatCurrent>
                        }
                        {repeat == ERepeat.list &&
                            <Icon.RepeatList className="button-icon player"></Icon.RepeatList>
                        }
                    </Button>

                    {
                        <Slider
                            displayTag={true}
                            min={0}
                            max={1}
                            value={useBind<number>("volume", w.audioVM)}
                            step={0.01}
                            popupY="-10px"
                            valueToString={(v) => `${Math.floor(v * 100)}%`}
                            onChanged={(ev) => w.audioVM.volume = ev.currentTarget.valueAsNumber}
                            onWheel={(ev) => w.audioVM.volume = ev.currentTarget.valueAsNumber}
                        ></Slider>}

                </Buttons>

                <Slider
                    displayTag={true}
                    min={0}
                    max={useBind<number>("duration", w.audioVM)}
                    value={useBind<number>("seek", w.audioVM)}
                    step={0.05}
                    popupY="-30px"
                    valueToString={(v) => {
                        let min = ("" + Math.floor(v / 60)).padStart(2, "0")
                        let sec = ("" + Math.floor(v % 60)).padStart(2, "0")
                        return `${min}:${sec}`
                    }}
                    onMouseUp={(ev) => { w.audioVM.seek = ev.currentTarget.valueAsNumber }}
                ></Slider>
            </Control>
        </Root>
    )
}

