import React, { useState, useRef, CSSProperties, useEffect } from 'react';
import ReactDOM from 'react-dom';

import styled, { keyframes } from 'styled-components';
import { useDomAttr, useStaticCSS } from '../../Utils/ReactHook';

class ScrollingTextProps {

}

const Root = styled.div`
overflow:hidden;
white-space: nowrap;
`
const Moving = styled.div`
overflow:hidden;
white-space: nowrap;
display: inline-block;
&>div{
    display: inline-block;
    padding-right: 30px;
}
`
export const ScrollingText: React.FC<ScrollingTextProps> = (props) => {
    useStaticCSS("scrolling-text-keyframe",
        `@keyframes scrolling-text-keyframe{
    0% {
        transform: translateX(0%);
    }
    20% {
        transform: translateX(0%);
    }
    100% {
        transform: translateX(-50%);
}`)
    const [rootRef, outterWidth] = useDomAttr<HTMLDivElement, number>(0, (v) => v, "clientWidth")
    const [div1Ref, innerWidth] = useDomAttr<HTMLDivElement, number>(0, (v) => v, "clientWidth")
    const shouldAnimation = useRef(false)
    useEffect(() => {
        shouldAnimation.current = (innerWidth.current - 30 - outterWidth.current) > 0
    })
    return (
        <Root ref={rootRef} {...props}>
            <Moving style={{
                animation: shouldAnimation.current ?
                    `scrolling-text-keyframe ${innerWidth.current * 0.03}s linear infinite` : "",
                animationDelay: "1s"
            }}>
                <div ref={div1Ref} data-should-animation={shouldAnimation.current}
                >
                    {props.children}
                </div>
                {shouldAnimation.current &&
                    <div data-should-animation={shouldAnimation.current}>
                        {props.children}
                    </div>
                }
            </Moving>

        </Root >
    )
}