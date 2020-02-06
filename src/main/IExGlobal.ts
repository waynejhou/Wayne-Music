import * as AppHost from "./AppHost"
import * as AppIpc from "./AppIpc"

// Global 介面擴充，以參照重要物件
export interface IExGlobal extends NodeJS.Global {
    sessCenter: AppHost.SessionCenter,
    mainRouter: AppIpc.MainRouter,
    cmdCenter: AppHost.CommandCenter,
    menuCenter: AppHost.MenuCenter,
    createSession: ()=>any
}

export function cast2ExGlobal(g:NodeJS.Global){
    return <IExGlobal>g
}