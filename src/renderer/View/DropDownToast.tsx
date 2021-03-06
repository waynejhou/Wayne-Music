import React, { useState, useCallback, useEffect } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import ReactDOM from 'react-dom';
//import './DropDownToast.css'
import { useBind } from '../ViewModel/ReactBindHook';
import { Theme } from '.'
import { Toast, EToastIcon } from '../../shared/Toast';
import styled from 'styled-components';
import { useStaticCSS } from '../Utils/ReactHook';
import { ExWindow } from '../ExWindow';

const Root = styled.div`
margin-left: auto;
margin-right: auto;
margin-bottom: auto;
grid-row: 1;
grid-column: 1;
z-index: 1;
`
const ToastDiv = styled.div`
font-size: 2rem;
padding-left: 50px;
padding-right: 50px;
padding-top: 10px;
padding-bottom: 10px;
background-color: ${Theme.var("--main-bg-color")};
border-style: solid;
border-color: ${Theme.var("--main-fg-color")};
border-width: 1px;
border-radius: 5px;
`
const LdsFacebook = styled.div`
display: inline-block;
position: relative;
width: 28px;
height: 24px;
& div{
    display: inline-block;
    position: absolute;
    left: 0px;
    width: 4px;
    background: #fff;
    animation: lds-facebook 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite;
}
& div:nth-child(1) {
    left: 0px;
    animation-delay: -0.24s;
}

& div:nth-child(2) {
    left: 8px;
    animation-delay: -0.12s;
}

& div:nth-child(3) {
    left: 16px;
    animation-delay: 0;
}
`

export class DropDownToastProps {
}
export const DropDownToast: React.FC<DropDownToastProps> = (props) => {
    const w = window as ExWindow
    const toasts = useBind<Toast[]>("showingToasts", w.toastVM)
    useStaticCSS("lds-facebook-keyframes",
    `@keyframes lds-facebook {
    0% {
        top: 4px;
        height: 20px;
    }
    50%, 100% {
        top: 8px;
        height: 12px;
    }
}`)
    return (
        <Root>
            <TransitionGroup>
                {toasts.length != 0 &&
                    toasts.map(v => {
                        useStaticCSS("css-transition-toast",
                        `
.toast-enter.drop-down-toast{
    opacity: 0;
}
.toast-enter-active.drop-down-toast{
    opacity: 1;
    transition: opacity 500ms ease-in;
}

.toast-exit.drop-down-toast{
    opacity: 1;
}
.toast-exit-active.drop-down-toast{
    opacity: 0;
    transition: opacity 500ms ease-in;
}`)
                        return (
                            <CSSTransition key={v.id} timeout={500} classNames="drop-down-toast toast">
                                <ToastDiv>
                                    {(v.icon && v.icon == EToastIcon.Loading) &&
                                        <LdsFacebook><div></div><div></div><div></div></LdsFacebook>}
                                    {v.message}
                                </ToastDiv>
                            </CSSTransition>
                        )
                    })
                }
            </TransitionGroup>
        </Root>
    )
}