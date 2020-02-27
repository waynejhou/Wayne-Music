import * as AppFactory from "../AppFactory";
import * as App from "../App";
import * as AppSess from "../AppSess";
import { Message, Command } from "../AppIpc";
import { Audio } from "../../shared/Audio";
import { Toast, EToastIcon } from "../../shared/Toast";
import { StatusHost } from "./StatusHost";

export type ICommand<T> = (args: T) => void

export class Commands {
    private sessCenter: AppSess.SessionCenter
    public constructor(info: App.Info, sessCenter: AppSess.SessionCenter) {
        this.audioFactory = new AppFactory.AudioFactory(info)
        this.lyricFactory = new AppFactory.LyricFactory()
        this.sessCenter = sessCenter
    }
    private lyricFactory: AppFactory.LyricFactory
    private audioFactory: AppFactory.AudioFactory;
    public openAudio: ICommand<{ sess: AppSess.Session }> = async (args) => {
        let sess = this.sessCenter.lastFocusSess
        if (args.sess) sess = args.sess
        try {
            let idx = 0
            for await (const audio of this.audioFactory.openDialog_loadAudio(sess.rendererWindow)) {
                if (idx == 0) {
                    sess.router.send("renderer",
                        new Message("cmds", "audio",
                            new Command("update", "current", audio)
                        )
                    )
                    sess.router.sendSync("renderer",
                        new Message("cmds", "toast",
                            new Command("drop", "toast", new Toast(1000, -1, ` Loading...`, EToastIcon.Loading))
                        )
                    ).then((id) => {
                        sess.sessStatusHost.audioLoaded.doOnce(() => {
                            sess.router.send("renderer", new Message("cmds", "toast",
                                new Command("cancel", "toast", id[0].data)
                            ))
                        })
                    })
                }
                sess.router.send("renderer",
                    new Message("cmds", "list",
                        new Command("add", "currentlist", audio)
                    )
                )
                idx++;
            }
        } catch (error) {
            console.log(error)
            return
        }
    }

    public openAudioByPaths: ICommand<{ paths: string[], sess: AppSess.Session }> = async (args) => {
        let paths = [] as string[]
        let sess = this.sessCenter.lastFocusSess
        if (args.paths) paths = args.paths
        if (args.sess) sess = args.sess
        try {
            let idx = 0
            for await (const audio of this.audioFactory.loadAudiosByPaths(paths)) {
                if (idx == 0) {
                    sess.router.send("renderer",
                        new Message("cmds", "audio",
                            new Command("update", "current", audio)
                        )
                    )
                    sess.router.sendSync("renderer",
                        new Message("cmds", "toast",
                            new Command("drop", "toast", new Toast(1000, -1, ` Loading...`, EToastIcon.Loading))
                        )
                    ).then((id) => {
                        sess.sessStatusHost.audioLoaded.doOnce(() => {
                            sess.router.send("renderer", new Message("cmds", "toast",
                                new Command("cancel", "toast", id[0].data)
                            ))
                        })
                    })
                }
                sess.router.send("renderer",
                    new Message("cmds", "list",
                        new Command("add", "currentlist", audio)
                    )
                )
                idx++;
            }
        } catch (error) {
            console.log(error)
            return
        }
    }

    public sendNotifyToast: ICommand<{ message: string, sess: AppSess.Session }> = async (args) => {
        let sess = this.sessCenter.lastFocusSess;
        if (!args.message) return;
        if (args.sess) sess = args.sess;
        sess.router.send("renderer", new Message("cmds", "toast", new Command(
            "drop", "toast", new Toast(0, 5000, args.message))
        ))
    }

    public loadLyric: ICommand<{ sess: AppSess.Session, audio: Audio }> = async (args) => {
        if (!args.audio) return
        let sess = this.sessCenter.lastFocusSess
        if (args.sess) sess = args.sess

        const lyric = await this.lyricFactory.loadAudioLyric(args.audio.path)
        sess.router.send("renderer",
            new Message("cmds", "lyric",
                new Command("update", "lyric", lyric)
            )
        )
    }
}