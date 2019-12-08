import * as express from 'express';
import * as path from 'path';

export function getPresetExpressApp(electronAppPath: string): express.Express {
    const app = express();
    const VIEWPATH = path.join(electronAppPath, 'views');
    const STATICPATH = path.join(electronAppPath, 'www')

    app.use(express.static(STATICPATH));

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
    getPresetExpressApp:getPresetExpressApp
}