import { pathToFileURL } from 'url'
import { IAudioMetadata } from 'music-metadata'
import * as path from 'path'

/**
 * Audio Data Structure
 */
export class Audio {
    public constructor(nativePath: string, metadata?: IAudioMetadata, picture?: string) {
        if (nativePath) {
            this.path = nativePath
            if (this.path.startsWith("\\\\")) {
                this.url = `file:${this.path.replace(/\\/gm, "/")}`
            } else {
                this.url = pathToFileURL(nativePath).href
            }


        }
        if (metadata) {
            this.album = metadata.common.album
            this.albumartist = metadata.common.albumartist
            this.artist = metadata.common.artist
            this.comment = (metadata.common.comment ? metadata.common.comment[0] : null)
            this.date = metadata.common.date
            this.disk = metadata.common.disk
            this.duration = metadata.format.duration
            this.genre = (metadata.common.genre ? metadata.common.genre[0] : null)
            this.title = metadata.common.title
            this.track = metadata.common.track
            this.year = metadata.common.year
        }
        if (picture) {
            this.picture = pathToFileURL(picture).href
        }
    }
    public album: string = null

    public albumartist: string = null

    public artist: string = null

    public comment: string = null

    public date: string = null

    public disk: { no: number, of: number } = null

    public duration: number = null;

    public genre: string = null

    public path: string = null;

    public picture: string = null;

    public title: string = null

    public track: { no: number, of: number } = null

    public url: string = null

    public year: number = null

    public toString(): string {
        return `Audio[Url: ${this.url}]`;
    }
    public static readonly default: Audio = Object.seal({
        album: null,
        albumartist: null,
        artist: null,
        comment: null,
        date: null,
        disk: null,
        duration: null,
        genre: null,
        path: null,
        picture: null,
        title: null,
        track: null,
        url: null,
        year: null,
    })
}

export enum EPlayback {
    stopped,
    playing,
    paused,
}

export enum ERepeat {
    off,
    list,
    current,
}

export enum ERandom {
    off,
    on
}

export enum EAudioModelState {
    idle, loading
}