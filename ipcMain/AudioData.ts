import { pathToFileURL } from 'url'
import { IAudioMetadata } from 'music-metadata'
import { bytesToBase64 } from './Base64'

export class AudioData {
    public constructor(nativePath: string, metadata: IAudioMetadata, picture:string) {
        this.album = metadata.common.album
        this.albumartist = metadata.common.albumartist
        this.artist = metadata.common.artist
        this.comment = (metadata.common.comment ? metadata.common.comment[0] : null)
        this.date = metadata.common.date
        this.disk = metadata.common.disk
        this.duration = metadata.format.duration
        this.genre = (metadata.common.genre ? metadata.common.genre[0] : null)
        this.picture = picture
        this.title = metadata.common.title
        this.track = metadata.common.track
        this.url = pathToFileURL(nativePath).href
        this.year = metadata.common.year
    }
    public album: string = null

    public albumartist: string = null

    public artist: string = null

    public comment: string = null

    public date: string = null

    public disk: { no: number, of: number } = null

    public duration: number = null;

    public genre: string = null

    public picture: string = "img/Ellipses.png"

    public title: string = null

    public track: { no: number, of: number } = null

    public url: string = null

    public year: number = null

    public toString() : string  {
        return `AudioData(Url: ${this.url})`;
    }
}