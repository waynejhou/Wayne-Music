import * as commandLineArgs from 'command-line-args'
import { CommandLine } from 'electron'
import { IHost } from '../AppHost'
import * as AppIpc from '../AppIpc'
import { cast2ExGlobal } from '../IExGlobal'

const g = cast2ExGlobal(global)

export class ArgOptionDefinition{
    public audioFiles: string[]
    public useDevServer: Boolean
    public devServerPort: Number
}

const optionDefinitions = [
    { name: 'audioFiles', type: String, multiple: true, defaultOption: true },
    { name: 'useDevServer', alias: 'd', type: Boolean },
    { name: 'devServerPort', alias: 'p', type: Number },
]

export class InfoHost{
    public args:ArgOptionDefinition
    public constructor(){
        this.args = <ArgOptionDefinition>commandLineArgs(optionDefinitions)
        g.stateCenter.once('session-ready', ()=>{
            g.cmdCenter.loadAudiosByPaths_SendAudio_Play(this.args.audioFiles, g.sessCenter.lastFocusSess)
        })
    }
}