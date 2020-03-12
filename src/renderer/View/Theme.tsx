import chroma from 'chroma-js'
import styled, { keyframes } from 'styled-components';


export class Theme {
    public "--main-bg-color": chroma.Color;
    public "--main-fg-color": chroma.Color;
    public "--main-layer-color": chroma.Color;
    public "--main-layer-color--hover": chroma.Color;
    public "--main-layer-color-more": chroma.Color;
    public "--main-layer-color-more--hover": chroma.Color;
    public "--main-active-color": chroma.Color;
    public "--main-active-color--hover": chroma.Color;
    public "--main-active-color-more": chroma.Color;
    public "--main-active-color-more--hover": chroma.Color;

    public constructor() {
        this["--main-bg-color"] = chroma("black")
        this["--main-fg-color"] = chroma("white")
        this["--main-layer-color"] = chroma("white").alpha(0.1)
        this["--main-layer-color--hover"] = chroma("white").alpha(0.2)
        this["--main-layer-color-more"] = chroma("white").alpha(0.2)
        this["--main-layer-color-more--hover"] = chroma("white").alpha(0.3)
        this["--main-active-color"] = chroma("orange").darken()
        this["--main-active-color--hover"] = this["--main-active-color"].brighten()
        this["--main-active-color-more"] = this["--main-active-color"].darken()
        this["--main-active-color-more--hover"] = this["--main-active-color"].darken().brighten()
    }

    public toString() {
        return Object.entries(this).filter(([k, v]) => k.startsWith('--')).map(([k, v]) => `${k}: ${v};`).join("")
    }

    public static var(key: keyof Theme) {
        return `var(${key})`;
    }
}

export const Container = styled.div`
background-color: ${Theme.var("--main-layer-color")};
margin: 5px;
border-radius: 5px;
`
export const Dock = styled.div`
display: grid;
`

