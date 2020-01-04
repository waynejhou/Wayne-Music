_: {
    if (!((typeof IsListRenderCalled) === 'undefined')) { break _ }
    IsListRenderCalled = true;

    updateCurrentList = (list) => {
        $('#list-container').empty()
        $('#list-container').prop("mode", "normal")
        let elements = list.map((data, idx) => {
            let playing = ""
            if (data.url == Responds.Current.url) {
                playing = "▶"
            }
            return $(`
            <div id="list-item-${idx}" idx=${idx} class="list-item">
                <button id="list-item-checkbox" class="background-transparent list-item-property"><i class="material-icons"></i></button>
                <span id="list-item-idx" class="list-item-property">${idx + 1}.</span>
                <span id="list-item-playing" class="list-item-property">${playing}</span>
                <span id="list-item-title" class="list-item-property">${data.title}</span>
                <span id="list-item-album" class="list-item-property">${data.album}</span>
                <span id="list-item-duration" class="list-item-property">${duration2string(data.duration)}</span>
            </div>
            `)
        })
        $('#list-container').append(elements)
    }

    $('#body-container').on("change", '.list-item', (ev) => {
        console.log(ev)
    })

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

    OnBodyChanged.list = () => {
        let sa = getSelectedAudio()
        if (typeof sa == "undefined") return;
        updateCoverBackground(sa.picture)
        updateCoverBottomright(sa.picture)
    }
}







