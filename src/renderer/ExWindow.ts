import { AudioViewModel, LyricViewModel, ToastViewModel, ListViewModel } from './ViewModel';
import { RendererRouter } from './Utils';
import { Theme } from './View';
export class GetParameters {
    public name: string;
    public constructor(getString: string) {
        const parameters = new URLSearchParams(location.search)
        this.name = parameters.get('name');
    }
}
export type ExWindow = Window & typeof globalThis & {
    get: GetParameters
    theme: Theme
    router: RendererRouter
    audioVM: AudioViewModel
    lyricVM: LyricViewModel
    toastVM: ToastViewModel
    listVM: ListViewModel
}