import * as AppFactory from "../AppFactory";
import * as App from "../App";
import { Message, Command } from "../AppIpc";

export type ICommand = (args: any) => void

export class Commands {
    private sessCenter: App.SessionCenter
    public constructor(info: App.Info, cmdArg: App.CommandLineArgs, sessCenter: App.SessionCenter) {
        this.audioFactory = new AppFactory.AudioFactory(info, cmdArg)
        this.sessCenter = sessCenter
    }

    private audioFactory: AppFactory.AudioFactory;
    public openAudio: ICommand = async (args) => {
        let sess = this.sessCenter.lastFocusSess
        if (args["sess"]) sess = args.sess
        try {
            const audios = await this.audioFactory.openDialog_loadAudio()
            const first = audios[0]
            sess.router.send("renderer",
                new Message("cmds", "audio",
                    new Command("update", "current", first)
                )
            )
            const rest = audios.slice(1)
            if (rest.length > 0) {
                sess.router.send("renderer",
                    new Message("cmds", "list",
                        new Command("update", "current", rest)
                    )
                )
            }
        } catch (error) {
            console.log(error)
            return
        }
    }

    public openAudioByPaths: ICommand = async (args) => {
        let paths = []
        let sess = this.sessCenter.lastFocusSess
        if (args["paths"]) paths = args.paths
        if (args["sess"]) sess = args.sess
        try {
            const audios = await this.audioFactory.loadAudiosByPaths(paths)
            const first = audios[0]
            sess.router.send("renderer",
                new Message("cmds", "audio",
                    new Command("update", "current", first)
                )
            )
            const rest = audios.slice(1)
            if (rest.length > 0) {
                sess.router.send("renderer",
                    new Message("cmds", "list",
                        new Command("update", "current", rest)
                    )
                )
            }
        } catch (err) {
            console.log(err)
        }
    }
}