export class Toast {
    public id: number
    public duration: number
    public message: string
    public delay: number
    public icon: EToastIcon
    public constructor(delay: number, duration: number, message: string, icon:EToastIcon=null) {
        this.delay = delay
        this.duration = duration
        this.message = message
        this.icon = icon
    }
}

export enum EToastIcon {
    None,
    Loading
}