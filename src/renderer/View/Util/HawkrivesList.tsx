import React, { useRef, useEffect, useState, ReactText, ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { useBind } from '../../Utils/ReactBindHook';
import { Audio } from "../../AppAudio"

import includes from 'lodash/includes'
import range from 'lodash/range'
import reject from 'lodash/reject'
import uniq from 'lodash/uniq'
import cx from 'classnames'
import values from 'lodash/values'

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

export class HawkrivesListProps {
    className?: string
    items: Array<ReactNode>
    selected: Array<number>
    disabled: Array<number>
    multiple: boolean
    onChange: (changedItem: null | number | Array<number>) => any
    keyboardEvents: boolean
    static _default: HawkrivesListProps = {
        items: [],
        selected: [],
        disabled: [],
        multiple: false,
        onChange: (changedItem) => { },
        keyboardEvents: true
    }
    static get default() {
        return this._default
    }
}

export class SelectArgs {
    index: null | number
    contiguous: boolean
}

/**
 * Hook version of https://github.com/hawkrives/react-list-select
 * @param props `HawkrivesListProps`
 */
export const HawkrivesList: React.FC<HawkrivesListProps> = (props) => {
    const [items, setItems] = useState(props.items)
    const [selectedItems, setSelectedItems] = useState(props.selected)
    const [disabledItems, setDisabledItems] = useState(props.disabled)
    const [focusedIndex, setFocusedIndex] = useState(null)
    const [lastSelected, setLastSelected] = useState(null)
    useEffect(() => {
        setItems(props.items)
        setDisabledItems(props.disabled)
        setSelectedItems(props.selected)
    }, [props.items, props.selected, props.disabled])
    function clear() {
        setSelectedItems([])
        setDisabledItems([])
        setFocusedIndex(null)
        setLastSelected(null)
    }
    function select({ index, contiguous = false }: SelectArgs = { index: undefined, contiguous: undefined }) {
        if (index === null) {
            return
        }
        if (includes(disabledItems, index)) {
            return
        }
        const { multiple } = props
        let tSelectedItems = multiple ? [...selectedItems, index] : [index]
        if (contiguous && multiple && typeof lastSelected === 'number') {
            const start = Math.min(lastSelected, index)
            const end = Math.max(lastSelected, index)
            tSelectedItems = uniq([
                ...selectedItems,
                ...range(start, end + 1),
            ])
        }
        setSelectedItems(tSelectedItems)
        setLastSelected(index)
    }
    useEffect(() => {
        props.onChange(props.multiple ? selectedItems : lastSelected)
    }, [selectedItems, lastSelected])
    function deselect({ index, contiguous = false }: SelectArgs = { index: undefined, contiguous: undefined }) {
        if (index === null) {
            return
        }
        const { multiple } = props

        if (contiguous && multiple && typeof lastSelected === 'number') {
            const start = Math.min(lastSelected, index)
            const end = Math.max(lastSelected, index)
            const toDeselect = range(start, end + 1)
            setSelectedItems(
                reject(selectedItems, idx =>
                    includes(toDeselect, idx),
                ))
        } else {
            setSelectedItems(reject(selectedItems, idx => idx === index))
        }
        setLastSelected(index)
    }
    useEffect(() => {
        props.onChange(props.multiple ? selectedItems : null)
    }, [selectedItems, lastSelected])
    function disable1(index: number) {
        const indexOf = disabledItems.indexOf(index)
        setDisabledItems([...disabledItems].splice(indexOf, 1))
    }
    function disable2(index: number) {
        setDisabledItems([...disabledItems, index])
    }
    function focusIndex(index: null | number = null) {
        if (index === null) {
            return
        }
        if (!includes(disabledItems, index) && typeof index === 'number') {
            setFocusedIndex(index)
        }
    }
    function focusPrevious() {
        const lastItem = items.length - 1
        let tFocusedIndex = focusedIndex
        if (focusedIndex === null) {
            tFocusedIndex = lastItem
        } else {
            // focus last item if reached the top of the list
            tFocusedIndex = focusedIndex <= 0 ? lastItem : focusedIndex - 1
        }
        if (disabledItems.length) {
            while (includes(disabledItems, tFocusedIndex)) {
                tFocusedIndex = focusedIndex <= 0 ? lastItem : focusedIndex - 1
            }
        }
        setFocusedIndex(tFocusedIndex)
    }
    function focusNext() {
        const lastItem = items.length - 1
        let tFocusedIndex = focusedIndex
        if (focusedIndex === null) {
            tFocusedIndex = 0
        } else {
            // focus first item if reached last item in the list
            tFocusedIndex = focusedIndex >= lastItem ? 0 : focusedIndex + 1
        }
        if (disabledItems.length) {
            while (includes(disabledItems, tFocusedIndex)) {
                tFocusedIndex = focusedIndex >= lastItem ? 0 : focusedIndex + 1
            }
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
        const { contiguous, index } = args
        if (index === null) {
            return
        }

        if (!includes(selectedItems, index)) {
            select({ index, contiguous })
        } else if (props.multiple) {
            deselect({ index, contiguous })
        }
    }
    function toggleKeyboardSelect(args: {
        event: React.KeyboardEvent<HTMLDivElement>,
        index: null | number,
    }) {
        const { event, index } = args
        event.preventDefault()
        const shift = event.shiftKey
        toggleSelect({ contiguous: shift, index })
    }
    function toggleMouseSelect(args: {
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
    }) {
        const { event, index } = args
        event.preventDefault()
        const shift = event.shiftKey
        toggleSelect({ contiguous: shift, index })
    }
    return (
        <div
            className={cx('react-list-select', props.className)}
            tabIndex={0}
            onKeyDown={props.keyboardEvents ? onKeyDown : undefined}
        >
            {items.map((itemContent, index) => {
                const disabled = includes(disabledItems, index)
                const selected = includes(selectedItems, index)
                const focused = focusedIndex === index
                return (
                    <HawkrivesListItem
                        key={index}
                        index={index}
                        disabled={disabled}
                        selected={selected}
                        focused={focused}
                        onMouseOver={focusIndex}
                        onChange={toggleMouseSelect}
                    >
                        {itemContent}
                    </HawkrivesListItem>
                )
            })}
        </div>
    )
}

export class HawkrivesListItemProps {
    disabled: boolean
    selected: boolean
    focused: boolean
    onMouseOver: (idx: number) => any
    index: number
    onChange: (args: { event: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number }) => any
    static _default: HawkrivesListItemProps = {
        disabled: false,
        selected: false,
        focused: false,
        onMouseOver: undefined,
        index: undefined,
        onChange: undefined
    }
    static get default() {
        return this._default
    }
}

export const HawkrivesListItem: React.FC<HawkrivesListItemProps> = (props) => {
    function handleMouseOver() {
        props.onMouseOver(props.index)
    }

    function handleChange(ev: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        props.onChange({ event: ev, index: props.index })
    }

    const classes = cx('react-list-select--item', {
        'is-disabled': props.disabled,
        'is-selected': props.selected,
        'is-focused': props.focused,
    })
    return (
        <div
            className={classes}
            onMouseOver={handleMouseOver}
            onClick={handleChange}
        >
            {props.children}
        </div>
    )
}

