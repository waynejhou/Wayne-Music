_: {
    if (!((typeof IsListUserInterfaceCalled) === 'undefined')) { break _ }
    IsListUserInterfaceCalled = true;
    ListSelectedAudio = null;
    ListSelectedAudioIdx = null;

    getSelectedAudio = () => {
        if (ListSelectedAudioIdx != null) return Responds.CurrentList[ListSelectedAudioIdx];
        return Responds.Current
    }

    updateCoverList = (data) => {
        $('img#metadata-cover-list').attr('src', data.picture)
    }

    ckeckItemInList = (idx) => {
        $('.list-item > #list-item-checkbox').each((_, ele) => {
            $(ele).prop('checked', false)
            if (_ == idx) $(ele).prop('checked', true)
        })
        ListSelectedAudioIdx = idx
        updateCoverBackground(getSelectedAudio().picture)
        updateCoverList(getSelectedAudio())
    }

    $("#list-container").on('dblclick','.list-item', (e) => {
        let idx = parseInt($(e.currentTarget).attr('idx'))
        AppIpc.Send2Audio("Remote", "Current", Responds.CurrentList[idx])
    })
    
    $("#list-container").on('click','.list-item', (e) => {
        let idx = parseInt($(e.currentTarget).attr('idx'))
        ckeckItemInList(idx)
    })

    $(window).on('keydown', (ev)=>{
        if(CurrentBody!='list') return;
        if (ListSelectedAudioIdx == null) return;
        if(ev.keyCode==38){//ArrowUp
            if (ListSelectedAudioIdx == 0) return;
            ListSelectedAudioIdx -= 1;
        }
        if(ev.keyCode==40){//ArrowDown
            if (ListSelectedAudioIdx == Responds.CurrentList.length - 1) return;
            ListSelectedAudioIdx += 1;
        }
        ckeckItemInList(ListSelectedAudioIdx)
    })

}





