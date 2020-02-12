import { useState, useEffect } from "react"
import { INotifyPropChanged } from "../../shared/INotifyPropChanged"

export function useBind<T>(propName: string, source:INotifyPropChanged) {
    const [prop, setProp] = useState(source[propName] as T)
    useEffect(() => {
        function update() {
            setProp(source[propName])
        }
        source.onPropChanged.do(update)
        return ()=>{
            source.onPropChanged.remove(update)
        }
    })
    return prop
}