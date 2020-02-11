export interface IActionRequestEmitter {
    on(action: string, request: string, callback: (data: any) => void): number
    once(action: string, request: string, callback: (data: any) => void): number
    removeAll(action: string, request: string): void
    remove(action: string, request: string, id:number): void
}
