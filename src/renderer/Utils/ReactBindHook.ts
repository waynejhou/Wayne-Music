import { useState, useEffect } from "react"
import { INotifyPropChanged, PropertyChangedEventArgs } from "../../shared/INotifyPropChanged"

export function useBind<T>(propName: string, source: INotifyPropChanged) {
    const [prop, setProp] = useState(source[propName] as T)
    useEffect(() => {
        function update(sender: any, args: PropertyChangedEventArgs) {
            if (args.propName == propName) setProp(source[propName])
        }
        source.onPropChanged.do(update)
        return () => {
            source.onPropChanged.remove(update)
        }
    })
    return prop
}