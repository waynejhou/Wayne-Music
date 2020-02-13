import { pathToFileURL } from 'url'
import { IAudioMetadata } from 'music-metadata'

/**
 * Audio Data Structure
 */
export class Audio {
    public constructor(nativePath: string, metadata?: IAudioMetadata, picture?: string) {
        if (nativePath) {
            this.path = nativePath
            this.url = pathToFileURL(nativePath).href
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
            this.picture = picture
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

    public picture: string = "src/resources/img/Ellipses.png"

    public title: string = null

    public track: { no: number, of: number } = null

    public url: string = null

    public year: number = null

    public toString(): string {
        return `Audio[Url: ${this.url}]`;
    }

    public static get empty() {
        return new Audio(
            null,
            null,
            "src/resources/img/Ellipses.png"
        )
    }
}

export enum EPlayback {
    playing,
    paused,
    stopped,
}

export enum ERepeat {
    off,
    current,
    list,
}

export enum ERandom {
    off,
    on
}