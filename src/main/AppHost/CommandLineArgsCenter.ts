import * as commandLineArgs from 'command-line-args'
import { CommandLine } from 'electron'
import { IHost } from '../AppHost'
import * as AppIpc from '../AppIpc'

export class ArgOptionDefinition{
    public audioFile: string[]
    public useDevServer: Boolean
    public devServerPort: Number
}

export class CommandLineArgsCenter implements IHost{
    public hostName: string
    public onGotMsg: (msg: AppIpc.Message) => void
    public args:ArgOptionDefinition
    private static optionDefinitions = [
        { name: 'audioFile', type: String, multiple: true, defaultOption: true },
        { name: 'useDevServer', alias: 'd', type: Boolean },
        { name: 'devServerPort', alias: 'p', type: Number },
    ]
    public constructor(){
        this.args = <ArgOptionDefinition>commandLineArgs(CommandLineArgsCenter.optionDefinitions)
    }

    public startAction(){

    }
}