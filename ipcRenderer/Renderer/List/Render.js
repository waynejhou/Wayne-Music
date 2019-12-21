function ckeckItemInList(idx, data) {
    $('#list-container').children().each((_, ele) => {
        $(ele).find('#list-item-checkbox').prop('checked', false)
        if (_ == idx) $(ele).find('#list-item-checkbox').prop('checked', true)
    })
    _listSelectedAudio = data
    _listSelectedAudioIdx = idx
    updateCover(getSelectedAudio().picture)
    updateCoverBackground(getSelectedAudio().picture)
    updateCoverList(getSelectedAudio())
}

function updateCurrentList(list) {
    $('#list-container').empty()
    list.forEach((element, idx) => {
        let playing = ""
        if (element.url == Responds.Current.url) {
            playing = "▶"
        }
        let newele = $(`
        <div id="list-item-${idx}" class="list-item">
            <input type="checkbox" id="list-item-checkbox" class="list-item-property"></input>
            <span id="list-item-idx" class="list-item-property">${idx + 1}.</span>
            <span id="list-item-playing" class="list-item-property">${playing}</span>
            <span id="list-item-title" class="list-item-property">${element.title}</span>
            <span id="list-item-album" class="list-item-property">${element.album}</span>
            <span id="list-item-duration" class="list-item-property">${duration2string(element.duration)}</span>
            <span id="list-item-border" class="list-item-property"></span>
        </div>
        `)
        newele.find('#list-item-checkbox').change((e) => {
            if (e.currentTarget.checked) {
                console.log(`checked ${idx} ${IsShiftKeyHolding}`)
            }
        })
        newele.on('dblclick', (e) => {
            AppIpc.Send2Audio("Remote", "Current", element)
        })
        newele.on('click', (e) => {
            ckeckItemInList(idx, element)
        })
        $('#list-container').append(
            newele
        )
    });
}

if (!OnResponds.CurrentList) {
    OnResponds.CurrentList = (list) => {
        updateCurrentList(list)
    }
}

if (Responds.CurrentList) {
    updateCurrentList(Responds.CurrentList)
} else {
    AppIpc.Send2Audio("Query", "CurrentList")
}
