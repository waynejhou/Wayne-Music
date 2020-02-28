import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './List.css'
import { useBind } from '../../Utils/ReactBindHook';
import { LyricDiv, LyricSpan } from '../../ViewModel/LyricViewModel';
import { HawkrivesList } from '../../AppView';
import { Audio } from '../../AppAudio'
import { OverflowYProperty } from 'csstype'
import { includes, values, range, reject, uniq } from 'lodash';
import * as Icon from '../Icon/Icons'
import cx from 'classnames'

export class ListProps {
}

export const List: React.FC<ListProps> = (props) => {
    const list = useBind<Audio[]>("current", window["listVM"])
    const picture = useBind<string>("picture", window["audioVM"])
    const rootRef = useRef(null as HTMLDivElement)
    const wrapperRef = useRef(null as HTMLDivElement)
    const selectRef = useRef([] as number[])
    const [isNeedScroll, setIsNeedScroll] = useState("none" as OverflowYProperty)
    const [selectedPic, setSelectedPic] = useState(null)
    const lastSelectedIdx = useRef(-1)
    useEffect(() => {
        setIsNeedScroll((rootRef.current.clientHeight >= wrapperRef.current.clientHeight ? "none" : "scroll") as OverflowYProperty)
    })
    return (
        <div className="root list" ref={rootRef}>
            <img src={selectedPic ? selectedPic : (picture ? picture : "img/Ellipses.png")} className="list cover"></img>
            <div className="wrapper list" ref={wrapperRef} style={{ overflowY: isNeedScroll }}>
                <HawkrivesAudioList
                    className="audio-list list"
                    keyboardEvents={true}
                    items={list}
                    selected={selectRef.current}
                    allowMultiple={true}
                    onChange={(selected) => {
                        if (selected.length > 0) setSelectedPic(list[selected[0]].picture)
                    }}
                    onItemDoubleClick={(selected) => {
                        console.log(selected)
                        if (selected.length > 0) window["audioVM"].current = list[selected[0]]
                    }}
                >
                </HawkrivesAudioList>
            </div>

        </div>

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
    onItemDoubleClick: (changedItem: Array<number>) => any
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
            setSelectedItems([index])
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
        } else if (props.allowMultiple) {
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
        <div
            className={cx('react-audio-list-select', props.className)}
            onKeyDown={props.keyboardEvents ? onKeyDown : undefined}
            onMouseLeave={(ev) => { clearFocus() }}
        >
            {items.map((itemContent, index) => {
                const selected = includes(selectedItems, index)
                const focused = focusedIndex === index
                const classes = cx('react-audio-list-select--item', {
                    'is-selected': selected,
                    'is-focused': focused,
                }, props.className)
                const playing = window['audioVM'].current.url == itemContent.url
                return (
                    <div key={cx('react-audio-list-select--item', index)}
                        className={classes}
                        onMouseOver={(ev) => { focusIndex(index) }}
                        onClick={(ev) => { toggleMouseSelect({ event: ev, index: index }) }}
                        onDoubleClick={(ev) => { if (props.onItemDoubleClick) props.onItemDoubleClick(selectedItems) }}
                    >
                        <span className="react-audio-list-select--item-property list">{index + 1}.</span>
                        <span className="react-audio-list-select--item-property list" style={{width:"25px"}}>
                            {playing && <Icon.Playing></Icon.Playing>}
                        </span>
                        <span className="react-audio-list-select--item-property list">{itemContent.title}</span>
                        <span className="react-audio-list-select--item-property list">{itemContent.album}</span>
                        <span className="react-audio-list-select--item-property list">{((v) => {
                            let min = ("" + Math.floor(v / 60)).padStart(2, "0")
                            let sec = ("" + Math.floor(v % 60)).padStart(2, "0")
                            return `${min}:${sec}`
                        })(itemContent.duration)}</span>
                    </div>
                )
            })}
        </div >
    )
}