import { pathToFileURL } from 'url'
import { IAudioMetadata } from 'music-metadata'
import { bytesToBase64 } from './Base64'

export class AudioData {
    public constructor(nativePath: string, metadata: IAudioMetadata) {
        this.album = metadata.common.album
        this.albumartist = metadata.common.albumartist
        this.artist = metadata.common.artist
        this.comment = (metadata.common.comment ? metadata.common.comment[0] : null)
        this.date = metadata.common.date
        this.disk = metadata.common.disk
        this.genre = (metadata.common.genre ? metadata.common.genre[0] : null)
        if (metadata.common.picture) {
            let pic = metadata.common.picture[0]
            this.picture = `data:${pic.format}base64,${bytesToBase64(pic.data)}`
        } else this.picture = "img/Ellipses.png"
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