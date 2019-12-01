const express = require('express');
const fs = require('fs')
const path = require('path')
const app = express();

let DIRPATH
let SERVER
let VIEWPATH
let STATICPATH


function init(electronApp){
    DIRPATH = path.join(electronApp.getAppPath());
    console.log(DIRPATH)
    VIEWPATH =  path.join(DIRPATH, 'src/views');
    STATICPATH = path.join(DIRPATH, 'src/www')
    app.use(express.static(STATICPATH));  

    console.log(VIEWPATH)
    console.log(STATICPATH)

    app.get('/', function (req, res) {
        res.sendFile(path.join(VIEWPATH, 'index.html'));
    });
    app.get('/index', function (req, res) {
        res.sendFile(path.join(VIEWPATH, 'index.html'));
    });
    app.get('/audio', function (req, res) {
        res.sendFile(path.join(VIEWPATH, 'audio.html'));
    });
    app.get('/cover', function (req, res) {
        res.sendFile(path.join(VIEWPATH, 'cover.html'));
    });
    app.get('/list', function (req, res) {
        res.sendFile(path.join(VIEWPATH, 'list.html'));
    });
}

function start(port){
    SERVER = app.listen(port, function () {
        console.log(`View Server running at http://127.0.0.1:${port}/`);
    });
    return port
}

function stop(){
    if(SERVER)
        SERVER.close()
}


module.exports = {
    init: init,
    start: start,
    stop: stop
}


if (require.main === module) {
    console.log("viewServer main")
    init({getAppPath:()=>{return '.'}});
    start(8888);
}