_: {
    if (!((typeof IsLyricUserInterfaceCalled) === 'undefined')) { break _ }
    IsLyricUserInterfaceCalled = true;
    $("#body-container").on('contextmenu', '#lyric-container', (ev) => {
        let data = null;
        if(Responds.Lyric) data = Responds.Lyric.path
        AppIpc.Send2MenuCenter("Popup", "Lyric", data);
    })
}