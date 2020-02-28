import React, { CSSProperties } from 'react';
import ReactDOM from 'react-dom';
import { IconProps } from './IconProps';

export const Cover: React.FC<IconProps> = (props) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0,0,100,100" preserveAspectRatio="xMidYMid meet">
            <path d="m 10,10 h80 v80 h-80 v-80 z  m 10,10 v60 h60 v-60 h-60 z"></path>
            <path fill-opacity="0.8" d="m 25,75 L 55,75 40,55"></path>
            <path fill-opacity="0.7" d="m 40,70 L 75,70 57.5,45"></path>
        </svg>
    )
}

export const WaveForm: React.FC<IconProps> = (props) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0,0,100,100" preserveAspectRatio="xMidYMid meet">
            <rect fill-opacity="1"   x="10" y="20" width="10" height="70"></rect>
            <rect fill-opacity="0.5" x="20" y="35" width="10" height="55"></rect>
            <rect fill-opacity="1"   x="30" y="30" width="10" height="60"></rect>
            <rect fill-opacity="0.5" x="40" y="50" width="10" height="40"></rect>
            <rect fill-opacity="1"   x="50" y="40" width="10" height="50"></rect>
            <rect fill-opacity="0.5" x="60" y="55" width="10" height="35"></rect>
            <rect fill-opacity="1"   x="70" y="70" width="10" height="20"></rect>
            <rect fill-opacity="0.5" x="80" y="85" width="10" height="5"></rect>
        </svg>
    )
}

export const List: React.FC<IconProps> = (props) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0,0,100,100" preserveAspectRatio="xMidYMid meet">
            <rect  x="10" y="10" width="15" height="15"></rect>
            <rect  x="45" y="10" width="45" height="15"></rect>
            <rect  x="10" y="40" width="15" height="15"></rect>
            <rect  x="45" y="40" width="45" height="15"></rect>
            <rect  x="10" y="70" width="15" height="15"></rect>
            <rect  x="45" y="70" width="45" height="15"></rect>
        </svg>
    )
}

export const Lyric: React.FC<IconProps> = (props) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0,0,100,100" preserveAspectRatio="xMidYMid meet">
            <rect fill-opacity="0.5" x="10" y="10" width="35" height="15"></rect>
            <rect fill-opacity="1" x="10" y="30" width="55" height="15"></rect>
            <rect fill-opacity="0.5" x="10" y="50" width="75" height="15"></rect>
            <rect fill-opacity="0.5" x="10" y="70" width="95" height="15"></rect>
        </svg>
    )
}

export const Playing: React.FC<IconProps> = (props) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0,0,100,100" preserveAspectRatio="xMidYMid meet">
            <polygon points="20,20 20,80 72,50"></polygon>
        </svg>
    )
}

export const Pause: React.FC<IconProps> = (props) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0,0,100,100" preserveAspectRatio="xMidYMid meet">
            <rect x="20" y="20" width="20" height="60"></rect>
            <rect x="60" y="20" width="20" height="60"></rect>
        </svg>
    )
}

export const StepForward: React.FC<IconProps> = (props) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0,0,100,100" preserveAspectRatio="xMidYMid meet">
            <polygon points="20,20 20,80 72,50"></polygon>
            <rect x="60" y="20" width="20" height="60"></rect>
        </svg>
    )
}
export const StepBackward: React.FC<IconProps> = (props) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0,0,100,100" preserveAspectRatio="xMidYMid meet">
            <rect x="20" y="20" width="20" height="60"></rect>
            <polygon points="27,50 80,20 80,80"></polygon>
        </svg>
    )
}

export const Random: React.FC<IconProps> = (props) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0,0,100,100" preserveAspectRatio="xMidYMid meet">
            <polygon points="20,30 30,20  72.5,62.5 80,55 80,80 55,80 62.5,72.5"></polygon>
            <polygon points="30,80 20,70 37,53 47,63"></polygon>
            <polygon points="63,47 53,37 62.5,27.5 55,20 80,20 80,45 72.5,37.5"></polygon>
        </svg>
    )
}

export const RepeatCurrent: React.FC<IconProps> = (props) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0,0,100,100" preserveAspectRatio="xMidYMid meet">
            <path d="M 25,30 a 50,100,0,0,1,50,15 L 65,45 a 50,100,0,0,0,-30,-15 Z"></path>
            <polygon points="60,45 80,45 70,60"></polygon>
            <path d="M 75,70 a 50,100,0,0,1,-50,-15 L 35,55 a 50,100,0,0,0,30,15 Z"></path>
            <polygon points="20,55 40,55 30,40"></polygon>
            <text x="80" y="80" fontFamily="Arial">1</text>
        </svg>
    )
}

export const RepeatList: React.FC<IconProps> = (props) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0,0,100,100" preserveAspectRatio="xMidYMid meet">
            <path d="M 25,30 a 50,100,0,0,1,50,15 L 65,45 a 50,100,0,0,0,-30,-15 Z"></path>
            <polygon points="60,45 80,45 70,60"></polygon>
            <path d="M 75,70 a 50,100,0,0,1,-50,-15 L 35,55 a 50,100,0,0,0,30,15 Z"></path>
            <polygon points="20,55 40,55 30,40"></polygon>
        </svg>
    )
}

export const RepeatOff: React.FC<IconProps> = (props) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0,0,100,100" preserveAspectRatio="xMidYMid meet">
            <polygon points="20,30 30,20  72.5,62.5 80,55 80,80 55,80 62.5,72.5"></polygon>
        </svg>
    )
}