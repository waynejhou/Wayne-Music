import React from 'react';
import ReactDOM from 'react-dom';
import './Switch.css'
import * as AppView from '../AppView';
import { useBind } from '../Utils/ReactBindHook';
import { Audio } from '../../shared/Audio';

export class SwitchProps {
    idx?: number
}

export const Switch: React.FC<SwitchProps> = (props) => {
    const idx = (props.idx !== undefined ? props.idx : 0)
    return (
        <div id="root" className="switch container">
            {idx == 0 &&
                <AppView.Cover></AppView.Cover >
            }
            {idx == 1 &&
                <AppView.WaveForm></AppView.WaveForm>
            }
            {idx == 2 &&
                <AppView.List></AppView.List>
            }
            {idx == 3 &&
                <AppView.Lyric></AppView.Lyric>
            }
        </div>
    )
}