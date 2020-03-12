import { useRef, useEffect, CSSProperties } from "react"


export function useDomAttr<TElement extends HTMLElement, TRetRef>
    (defaultValue: TRetRef, selector: (...value: any[]) => TRetRef, ...attrs: (keyof TElement)[])
    : [React.MutableRefObject<TElement>, React.MutableRefObject<TRetRef>] {
    const domRef = useRef<TElement>(null as TElement)
    const retRef = useRef<TRetRef>(defaultValue)
    useEffect(() => {
        retRef.current = selector(...attrs.map(k => domRef.current[k]))
    })
    return [domRef, retRef]
}

export type CSSPattern = {
    selector: string
    properties: CSSProperties
}



export function useStaticCSS(id: string, css: string) {
    var checkStyleExist = document.head.querySelector(`style#${id}.static-css`) && true
    if (!checkStyleExist) {
        document.head.appendChild(
            (() => {
                const ret = document.createElement("style")
                ret.id = id
                ret.className = "static-css"
                ret.innerHTML = css
                return ret
            })())
    }
}