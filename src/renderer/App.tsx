import React from 'react';
import ReactDOM from 'react-dom';
import { useEffect } from "react";

export class AppProps {
    public title?: string
    public render?: () => {};
}

export const App: React.FC<AppProps> = (props) => {
    useEffect(() => {
        document.title = props.title;
    });
    return (
        <div id='root' className='app'>
        </div>
    )
}
