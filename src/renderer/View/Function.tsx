import React from 'react';
import ReactDOM from 'react-dom';
import * as Icon from "./Icon/Icons"
import styled from 'styled-components';
import {Theme, Container} from '.'

const Root = styled(Container)`
display: flex;
flex-direction: column;
`
const Button = styled.button`
background-color: ${Theme.var("--main-layer-color")};
border: none;
margin: 5px;
border-radius: 5px;
width: 50px;
height: 50px;
font-size: 3rem;

&:hover{
    border: none;
    background-color: ${Theme.var("--main-layer-color--hover")};
}
&:active{
    border: none;
    background-color: ${Theme.var("--main-active-color")};
}
&:focus{
    outline: none;
    border: white;
    border-width: 1px;
    border-style: dashed;
    display: grid;
}
& > .function.button-icon{
    margin: auto;
    fill: ${Theme.var("--main-fg-color")};
}
`



export class FunctionProps {
    onClickFunction?: (idx: number) => void
}

export const Function: React.FC<FunctionProps> = (props) => {
    return (
        <Root>
            <Button onClick={(ev) => { props.onClickFunction(0) }}>
                <Icon.Cover className="button-icon function"></Icon.Cover></Button>
            <Button onClick={(ev) => { props.onClickFunction(1) }}>
                <Icon.WaveForm className="button-icon function"></Icon.WaveForm></Button>
            <Button onClick={(ev) => { props.onClickFunction(2) }}>
                <Icon.List className="button-icon function"></Icon.List></Button>
            <Button onClick={(ev) => { props.onClickFunction(3) }}>
                <Icon.Lyric className="button-icon function"></Icon.Lyric></Button>
        </Root>
    )
}
