import { IAudioMetadata } from 'music-metadata'

declare class AudioData{
    public constructor(nativePath: string, metadata: IAudioMetadata)
    public album: string

    public albumartist: string 

    public artist: string

    public comment: string

    public date: string

    public disk: { no: number, of: number }

    public genre: string

    public picture: string

    public title: string

    public track: { no: number, of: number }

    public url: string

    public year: number

    public toString() : string
}

export {AudioData}