import { useState, useEffect } from "react"
import { INotifyPropChanged, PropertyChangedEventArgs } from "."

export function useBind<T>(propName: string, source: INotifyPropChanged) {
    const [prop, setProp] = useState(source[propName] as T)
    useEffect(() => {
        function update(sender: any, args: PropertyChangedEventArgs) {
            if (args.propName == propName && prop != source[propName]){
                setProp(source[propName])
            }
        }
        source.onPropChanged.do(update)
        return () => {
            source.onPropChanged.remove(update)
        }
    }, [source[propName]])
    return prop
}