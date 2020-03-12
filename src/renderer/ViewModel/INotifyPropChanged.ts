import { IEventHandler } from "../../shared/EventHandler";

export class PropertyChangedEventArgs {
    public propName: string;
    public constructor(propName: string) {
        this.propName = propName
    }
}

export interface INotifyPropChanged {
    onPropChanged: IEventHandler<PropertyChangedEventArgs>
}
