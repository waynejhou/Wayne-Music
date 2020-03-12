import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
//import './List.css'
import { useBind } from '../../ViewModel';
import {Audio, EPlayback} from "../../../shared/Audio"
import { OverflowYProperty } from 'csstype'
import { includes, values, range, reject, uniq } from 'lodash';
import * as Icon from '../Icon/Icons'
import cx from 'classnames'
import styled from 'styled-components';
import {Theme} from '..'
import { Container } from '../Theme';
import { ExWindow } from '../../ExWindow';
const w = window as ExWindow
const Root = styled(Container)`
display: grid;
grid-column: 1;
grid-row: 1;
position: relative;
`

const Wrapper = styled.div`
grid-column: 1;
grid-row: 1;
z-index: 1;
position: absolute;
height: -webkit-fill-available;
width: -webkit-fill-available;
overflow-y: auto;
`

const Cover = styled.img`
grid-row: 1;
grid-column: 1;
z-index: 0;
max-width: 350px;
margin-left: auto;
margin-top: auto;
opacity: 0.5;
background-color: ${Theme.var("--main-layer-color")};
outline: thick solid ${Theme.var("--main-layer-color-more")};
`

const AudioItem = styled.div`
display: grid;
max-width: 100%;
padding-top: 5px;
padding-bottom: 5px;
padding-left: 10px;
margin-right: 10px;
padding-right: 10px;
font-size: 1.5rem;
white-space: nowrap;
grid-template-columns: min-content fit-content(25px) 1fr 1fr fit-content(100px);
grid-template-rows: 1fr;
border-top: 0px;
border-left: 0px;
border-bottom: 1px;
border-right: 0px;
border-color: ${Theme.var("--main-layer-color")};
border-style: solid;
&:nth-child(odd){
    background-color: ${Theme.var("--main-layer-color")};
}
&.is-focused{
    background-color: ${Theme.var("--main-layer-color--hover")};
}
&.is-selected{
    background-color: ${Theme.var("--main-active-color")};
}
&.is-selected.is-focused{
    background-color: ${Theme.var("--main-active-color--hover")};
}
`

const AudioProperty = styled.span`
padding-right: 5px;
padding-left: 5px;
overflow: hidden;
text-overflow: ellipsis;
margin-top: auto;
margin-bottom: auto;
`

export class ListProps {
}

export const List: React.FC<ListProps> = (props) => {
    const list = useBind<Audio[]>("current", w.listVM)
    const picture = useBind<string>("picture", w.audioVM)
    const selectRef = useRef([] as number[])
    const [selectedPic, setSelectedPic] = useState(null)
    const lastSelectedIdx = useRef(-1)
    return (
        <Root className="root">
            <Cover src={selectedPic ? selectedPic : (picture ? picture : "img/Ellipses.png")}></Cover>
            <Wrapper className="wrapper">
                <HawkrivesAudioList
                    keyboardEvents={true}
                    items={list}
                    selected={selectRef.current}
                    allowMultiple={true}
                    onChange={(selected) => {
                        if (selected.length > 0) setSelectedPic(list[selected[0]].picture)
                    }}
                    onItemDoubleClick={(selected) => {
                        w.audioVM.setCurrentAndPlay(list[selected])
                    }}
                >
                </HawkrivesAudioList>
            </Wrapper>

        </Root>

    )
}

export class SelectArgs {
    index: number
    enableContiguous: boolean
    enableMultiple: boolean
}

export const KEY = {
    UP: 38,
    DOWN: 40,
    ESC: 27,
    ENTER: 13,
    SPACE: 32,
    J: 74,
    K: 75,
}

export const KEYS = values(KEY)


export class HawkrivesAudioListPorps {
    className?: string
    items: Array<Audio>
    selected: Array<number>
    allowMultiple: boolean
    onChange: (changedItem: Array<number>) => any
    onItemDoubleClick: (changedItem: number) => any
    keyboardEvents: boolean
    static readonly default: HawkrivesAudioListPorps = {
        items: [],
        selected: [],
        allowMultiple: false,
        onChange: (changedItem) => { },
        onItemDoubleClick: (changedItem) => { },
        keyboardEvents: true
    }
}


/**
 * Hook version of https://github.com/hawkrives/react-list-select
 * Modify to Audio List Version
 * @param props `HawkrivesAudioListPorps`
 */
export const HawkrivesAudioList: React.FC<HawkrivesAudioListPorps> = (props) => {
    // States
    const [items, setItems] = useState(props.items)
    const [selectedItems, setSelectedItems] = useState(props.selected)
    const [focusedIndex, setFocusedIndex] = useState(null as number)
    const [lastSelected, setLastSelected] = useState(null as number[])


    //#region Effects
    // Monitor of props
    useEffect(() => {
        setItems(props.items)
        setSelectedItems(props.selected)
    }, [props.items, props.selected])
    // Monitor of states
    useEffect(() => {
        if (props.onChange) props.onChange(selectedItems)
    }, [items, selectedItems])
    //#endregion

    //#region Functions
    function clear() {
        setSelectedItems([])
        setFocusedIndex(null)
        setLastSelected(null)
    }
    function select({ index, enableContiguous = false, enableMultiple = false }: SelectArgs) {
        if (index === null) {
            return
        }
        const { allowMultiple } = props

        let tSelectedItems = allowMultiple && enableMultiple ? [...selectedItems, index] : [index]
        if (enableContiguous && allowMultiple && lastSelected.length == 1) {
            const start = Math.min(...lastSelected, index)
            const end = Math.max(...lastSelected, index)
            tSelectedItems = uniq([
                ...selectedItems,
                ...range(start, end + 1),
            ])
        }
        setSelectedItems(tSelectedItems)
        setLastSelected([index])
    }
    function deselect({ index, enableContiguous = false, enableMultiple = false }: SelectArgs) {
        if (index === null) {
            return
        }
        const { allowMultiple } = props

        if (enableContiguous && allowMultiple && lastSelected.length == 1) {
            const start = Math.min(...lastSelected, index)
            const end = Math.max(...lastSelected, index)
            const toDeselect = range(start, end + 1)
            setSelectedItems(
                reject(selectedItems, idx =>
                    includes(toDeselect, idx),
                ))
        } else if (allowMultiple && enableMultiple) {
            setSelectedItems(reject(selectedItems, idx => idx === index))
        } else {
            setSelectedItems([])
        }
        setLastSelected([index])
    }
    function focusIndex(index: number) {
        if (index === null) return
        setFocusedIndex(index)
    }
    function clearFocus() {
        setFocusedIndex(null)
    }
    function focusPrevious() {
        const lastItem = items.length - 1
        let tFocusedIndex = focusedIndex
        if (focusedIndex === null) {
            tFocusedIndex = lastItem
        } else {
            tFocusedIndex = focusedIndex <= 0 ? lastItem : focusedIndex - 1
        }
        setFocusedIndex(tFocusedIndex)
    }
    function focusNext() {
        const lastItem = items.length - 1
        let tFocusedIndex = focusedIndex
        if (focusedIndex === null) {
            tFocusedIndex = 0
        } else {
            tFocusedIndex = focusedIndex >= lastItem ? 0 : focusedIndex + 1
        }
        setFocusedIndex(tFocusedIndex)
    }
    function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
        const key = event.keyCode
        if (key === KEY.UP || key === KEY.K) {
            focusPrevious()
        } else if (key === KEY.DOWN || key === KEY.J) {
            focusNext()
        } else if (key === KEY.SPACE || key === KEY.ENTER) {
            toggleKeyboardSelect({
                event,
                index: this.state.focusedIndex,
            })
        }
        // prevent default behavior where in some situations pressing the
        // key up / down would scroll the browser window
        if (includes(KEYS, key)) {
            event.preventDefault()
        }
    }
    function toggleSelect(args: SelectArgs) {
        const { enableContiguous, enableMultiple, index } = args
        if (index === null) {
            return
        }
        console.log(args)
        if (!includes(selectedItems, index)) {
            select({ index, enableContiguous, enableMultiple })
        } else {
            deselect({ index, enableContiguous, enableMultiple })
        }
    }
    function toggleKeyboardSelect(args: {
        event: React.KeyboardEvent<HTMLDivElement>,
        index: null | number,
    }) {
        const { event, index } = args
        event.preventDefault()
        const shift = event.shiftKey
        const ctrl = event.ctrlKey
        toggleSelect({ enableContiguous: shift, enableMultiple: ctrl, index })
    }
    function toggleMouseSelect(args: {
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
    }) {
        const { event, index } = args
        event.preventDefault()
        const shift = event.shiftKey
        const ctrl = event.ctrlKey
        toggleSelect({ enableContiguous: shift, enableMultiple: ctrl, index })
    }
    //#endregion

    return (
        <div className="dsa" onKeyDown={props.keyboardEvents ? onKeyDown : undefined}
            onMouseLeave={(ev) => { clearFocus() }}>
            {items.map((itemContent, index) => {
                const selected = includes(selectedItems, index)
                const focused = focusedIndex === index
                const classes = cx({
                    'is-selected': selected,
                    'is-focused': focused,
                }, props.className)
                const playing = window['audioVM'].current.url == itemContent.url
                return (
                    <AudioItem key={index}
                        className={classes}
                        onMouseOver={(ev) => { focusIndex(index) }}
                        onClick={(ev) => { toggleMouseSelect({ event: ev, index: index }) }}
                        onDoubleClick={(ev) => { if (props.onItemDoubleClick) props.onItemDoubleClick(index) }}
                    >
                        <AudioProperty>{index + 1}.</AudioProperty>
                        <AudioProperty style={{width:"25px"}}>
                            {playing && <Icon.Playing style={{fill: Theme.var("--main-fg-color")}}></Icon.Playing>}
                        </AudioProperty>
                        <AudioProperty>{itemContent.title}</AudioProperty>
                        <AudioProperty>{itemContent.album}</AudioProperty>
                        <AudioProperty>{((v) => {
                            let min = ("" + Math.floor(v / 60)).padStart(2, "0")
                            let sec = ("" + Math.floor(v % 60)).padStart(2, "0")
                            return `${min}:${sec}`
                        })(itemContent.duration)}</AudioProperty>
                    </AudioItem>
                )
            })}
        </div >
    )
}