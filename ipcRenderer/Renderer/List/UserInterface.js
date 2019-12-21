
if (typeof _listSelectedAudio === 'undefined') {
    var _listSelectedAudio = null;
}
if (typeof _listSelectedAudioIdx === 'undefined') {
    var _listSelectedAudioIdx = null;
}
function getSelectedAudio() {
    if (_listSelectedAudio) return _listSelectedAudio;
    return Responds.Current
}
function updateCoverList(data) {
    $('img#metadata-cover-list').attr('src', data.picture)
}
if (!On_Up_Press) {
    On_Up_Press = (ev) => {
        if (!_listSelectedAudio) return;
        if (_listSelectedAudioIdx == 0) return;
        _listSelectedAudioIdx -= 1;

        Responds.CurrentList.forEach((data, idx) => {
            if (idx == _listSelectedAudioIdx) {
                ckeckItemInList(idx, data)
            }
        })
    }
}
if (!On_Down_Press) {
    On_Down_Press = (ev) => {
        if (!_listSelectedAudio) return;
        if (_listSelectedAudioIdx == Responds.CurrentList.length - 1) return;
        _listSelectedAudioIdx += 1;
        Responds.CurrentList.forEach((data, idx) => {
            if (idx == _listSelectedAudioIdx) {
                ckeckItemInList(idx, data)
            }
        })
    }
}
