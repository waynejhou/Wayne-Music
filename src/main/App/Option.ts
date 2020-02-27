export class Option {
    audioFiles: string[]
    useDevServer: boolean
    devServerPort: number
}
export const optionDefinitions = [
    { name: 'audioFiles', type: String, multiple: true, defaultOption: true },
    { name: 'useDevServer', alias: 'd', type: Boolean },
    { name: 'devServerPort', alias: 'p', type: Number },
    { name: 'allow-file-access-from-files', type: Boolean },
    { name: 'original-process-start-time', type: Number, }
]