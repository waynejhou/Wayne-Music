import { AudioPlayer, Audio, EPlayback, ERandom, ERepeat } from '../AppAudio'

export class AudioPlayerController{
    private audioPlayer:AudioPlayer
    public constructor(audioPlayer:AudioPlayer){
        this.audioPlayer = audioPlayer
    }

    public ctrl_PlayPause(){
        if(this.audioPlayer.playback==EPlayback.paused){
            this.audioPlayer.playback = EPlayback.playing
        }
        else if(this.audioPlayer.playback==EPlayback.stopped){
            this.audioPlayer.playback = EPlayback.playing
        }
        else if(this.audioPlayer.playback==EPlayback.playing){
            this.audioPlayer.playback = EPlayback.paused
        }
    }

    public setVolume(value:number){
        this.audioPlayer.volume = value
    }
    public incVolume(){
        this.audioPlayer.volume+=0.05
    }
    public decVolume(){
        this.audioPlayer.volume-=0.05
    }
}