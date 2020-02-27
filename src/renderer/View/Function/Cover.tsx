import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './Cover.css'
import { useBind } from '../../Utils/ReactBindHook';

export class CoverProps {
}

export const Cover: React.FC<CoverProps> = (props) => {
    const picture = useBind<string>("picture", window["audioVM"])
    return (
        <div id="root" className="cover" >
            <img src={picture ? picture : "img/Ellipses.png"} id="cover" className="cover"></img>
        </div>
    )
}