import * as express from 'express';
import * as path from 'path';
import { App } from 'electron'

export function getPresetExpressApp(electrinApp: App): express.Express {
    const app = express();
    const VIEWPATH = path.join(electrinApp.getAppPath(), 'views');
    const STATICPATH = path.join(electrinApp.getAppPath(), 'www');
    const EXEPATH = this._exePath = electrinApp.isPackaged ? path.dirname(electrinApp.getPath('exe')) : electrinApp.getAppPath();
    const COVERPATH = path.join(EXEPATH, 'Cover Cache');

    app.use(express.static(STATICPATH));
    app.use(express.static(COVERPATH));

    app.get('/', function (req: express.Request, res: express.Response) {
        res.sendFile(path.join(VIEWPATH, 'index.html'));
    });
    app.get('/web', function (req: express.Request, res: express.Response) {
        res.sendFile(path.join(VIEWPATH, 'webIndex.html'));
    });
    app.get('/audio', function (req: express.Request, res: express.Response) {
        res.sendFile(path.join(VIEWPATH, 'audio.html'));
    });
    app.get('/cover', function (req: express.Request, res: express.Response) {
        res.sendFile(path.join(VIEWPATH, 'cover.html'));
    });
    app.get('/list', function (req: express.Request, res: express.Response) {
        res.sendFile(path.join(VIEWPATH, 'list.html'));
    });

    return app
}


export default {
    getPresetExpressApp: getPresetExpressApp
}