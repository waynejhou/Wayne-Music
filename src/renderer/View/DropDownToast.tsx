import React, { useState, useCallback, useEffect } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import ReactDOM from 'react-dom';
import './DropDownToast.css'
import { useBind } from '../Utils/ReactBindHook';
import { Toast, EToastIcon } from '../../shared/Toast';

export class DropDownToastProps {
}
export const DropDownToast: React.FC<DropDownToastProps> = (props) => {
    const vm = window["toastVM"]
    const toasts = useBind<Toast[]>("showingToasts", vm)
    return (
        <div className="root drop-down-toast">
            <TransitionGroup>
                {toasts.length != 0 &&
                    toasts.map(v => {
                        return (
                            <CSSTransition key={v.id} timeout={500} classNames="drop-down-toast toast">
                                <div className="drop-down-toast toast">
                                    {(v.icon && v.icon == EToastIcon.Loading) && <div className="lds-facebook drop-down-toast"><div></div><div></div><div></div></div>}
                                    {v.message}
                                </div>
                            </CSSTransition>
                        )
                    })
                }
            </TransitionGroup>
        </div>
    )
}