_: {
    if (!((typeof IsListUserInterfaceCalled) === 'undefined')) { break _ }
    IsListUserInterfaceCalled = true;
    ListSelectedAudio = null;
    ListSelectedAudioIdx = null;

    function isPlatformModKeyHolding(metaKey, ctrlKey){
        if(navigator.platform=="MacIntel"){
            return metaKey
        }
        return ctrlKey
    }

    getSelectedAudio = () => {
        if (ListSelectedAudioIdx != null) return Responds.CurrentList[ListSelectedAudioIdx];
        return Responds.Current
    }
    
    ckeckItemInList = (idx) => {
        $(`.list-item`).attr('got_selected', () => { return false });
        $(`#list-item-${idx}`).attr('got_selected', () => { return true });
        $('#list-container').attr("mode", () => { return "selection" });
        let sa = getSelectedAudio()
        if (typeof sa == "undefined") return;
        updateCoverBackground(sa.picture)
        updateCoverBottomright(sa.picture)
    }

    ckeckAnotherItemInList = (idx) => {
        $(`#list-item-${idx}`).attr('got_selected', () => { return true });
        $('#list-container').attr("mode", () => { return "selection" });
        let sa = getSelectedAudio()
        if (typeof sa == "undefined") return;
        updateCoverBackground(sa.picture)
        updateCoverBottomright(sa.picture)
    }

    ckeckMultipleItemInList = (fromIdx, toIdx) => {
        $('#list-container').attr("mode", () => { return "selection" });
        $(`.list-item`).each((idx, e) => {
            if(idx>=fromIdx && idx <= toIdx && idx!=ListSelectedAudioIdx){
                let jele = $(e)
                if(jele.attr("got_selected")=="true"){
                    jele.attr("got_selected", ()=>{return false})
                }else{
                    jele.attr("got_selected", ()=>{return true})
                }
            }
        })
        let sa = getSelectedAudio()
        if (typeof sa == "undefined") return;
        updateCoverBackground(sa.picture)
        updateCoverBottomright(sa.picture)
    }

    $("#body-container").on('dblclick', '.list-item', (e) => {
        let idx = parseInt($(e.currentTarget).attr('idx'))
        AppIpc.Send2Audio("Remote", "Current", Responds.CurrentList[idx])
    })

    let clickInItem = false;
    $("#body-container").on('click', '.list-item', (e) => {
        let idx = parseInt($(e.currentTarget).attr('idx'))
        clickInItem = true;
        if (e.shiftKey) {
            if(ListSelectedAudioIdx<=idx){
                ckeckMultipleItemInList(ListSelectedAudioIdx, idx)
            }else{
                ckeckMultipleItemInList(idx, ListSelectedAudioIdx)
            }
            return
        }else if(isPlatformModKeyHolding(e.metaKey, e.ctrlKey)){
            ckeckAnotherItemInList(idx)
        }else{
            ckeckItemInList(idx)
        }
        
        ListSelectedAudioIdx = idx
    })

    $("#body-container").on('click', '#list-container', (e) => {
        if (clickInItem) { clickInItem = false; return; }
        $(e.currentTarget).attr("mode", () => { return "normal" });
        $(`.list-item`).attr('got_selected', () => { return false });
    })

    Mousetrap.bind('esc', ()=>{
        if (CurrentBody != 'list') return;
        $(`.list-item`).attr('got_selected', () => { return false });
    });
    Mousetrap.bind('up', ()=>{
        if (CurrentBody != 'list') return;
        if (ListSelectedAudioIdx == null) return;
        if (ListSelectedAudioIdx == 0) return;
        ListSelectedAudioIdx -= 1;
        ckeckItemInList(ListSelectedAudioIdx)
    });
    Mousetrap.bind('down', ()=>{
        if (CurrentBody != 'list') return;
        if (ListSelectedAudioIdx == null) return;
        if (ListSelectedAudioIdx == Responds.CurrentList.length - 1) return;
        ListSelectedAudioIdx += 1;
        ckeckItemInList(ListSelectedAudioIdx)
    });


    $("#body-container").on('contextmenu', '#list-container', (ev) => {
        let data = $(".list-item[got_selected=true]").toArray().map((e,i)=>{return parseInt($(e).attr('idx'))}) 
        AppIpc.Send2MenuCenter("Popup", "List", {idxs:data});
    })


}
