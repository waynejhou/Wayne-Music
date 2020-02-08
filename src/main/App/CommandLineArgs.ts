import * as commandLineArgs from 'command-line-args'

import * as App from "../App"
import * as AppHost from "../AppHost"

export class ArgOption {
    public audioFiles: string[]
    public useDevServer: boolean
    public devServerPort: Number
}
const optionDefinitions = [
    { name: 'audioFiles', type: String, multiple: true, defaultOption: true },
    { name: 'useDevServer', alias: 'd', type: Boolean },
    { name: 'devServerPort', alias: 'p', type: Number },
]
export class CommandLineArgs {
    public args: ArgOption
    public constructor(statusHost: AppHost.StatusHost) {
        this.args = <ArgOption>commandLineArgs(optionDefinitions)
    }
}