import { INotifyPropChanged, PropertyChangedEventArgs } from "../../shared/INotifyPropChanged"
import { IEventHandler, EventHandler } from "../../shared/EventHandler"

export class BaseViewModel implements INotifyPropChanged {
    public onPropChanged: IEventHandler<PropertyChangedEventArgs>
    public constructor() {
        this.onPropChanged = new EventHandler()
    }

    protected notifyPropChange(propName: string) {
        this.onPropChanged.invoke(this, new PropertyChangedEventArgs(propName))
    }
}