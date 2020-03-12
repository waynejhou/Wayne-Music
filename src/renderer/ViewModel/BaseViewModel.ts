import { INotifyPropChanged, PropertyChangedEventArgs } from "."
import { IEventHandler, EventHandler } from "../../shared/EventHandler"

export class BaseViewModel implements INotifyPropChanged {
    public onPropChanged: IEventHandler<PropertyChangedEventArgs>
    public constructor() {
        this.onPropChanged = new EventHandler()
    }

    protected notifyPropChange(propName: string) {
        if (this.onPropChanged.invokable)
            this.onPropChanged.invoke(this, new PropertyChangedEventArgs(propName))
    }
}