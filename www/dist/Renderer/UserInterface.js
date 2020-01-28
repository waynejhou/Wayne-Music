BodyCachedElements = {}
OnBodyChanged = {};
CurrentBody = null;
function bodyCachedLoad(url) {
    if (CurrentBody == url) return;
    CurrentBody = url
    AppIpc.Send2CrossProcessVariables("Set", "CurrentBody", CurrentBody)
    if (!(BodyCachedElements[url] === undefined)) {
        $('#body-container').empty().append(BodyCachedElements[url])
        if (!!OnBodyChanged[url]) OnBodyChanged[url]();
        return
    }
    $.ajax({
        type: "GET",
        url: url,
        async: true
    }).done(function (html) {
        BodyCachedElements[url] = $(html)
        $('#body-container').empty().append(BodyCachedElements[url])
        if (!!OnBodyChanged[url]) OnBodyChanged[url]();
    });
}


$('button#page-changing-cover').click(() => {
    bodyCachedLoad('cover')
})

$('button#page-changing-list').click(() => {
    bodyCachedLoad('list')
})

$('button#page-changing-lyric').click(() => {
    bodyCachedLoad('lyric')
})

$('#audio-controls-playpause-btn').click(() => {
    if (Responds["PlaybackState"] == 'playback-playing') {
        AppIpc.Send2Audio("Remote", "PlaybackState", 'playback-paused')
    }
    else {
        AppIpc.Send2Audio("Remote", "PlaybackState", 'playback-playing')
    }
});

$('#audio-controls-repeat-btn').click(() => {
    let loop = !Responds["Loop"]
    AppIpc.Send2Audio("Remote", "Loop", loop)
});

let isPosSliderMouseDown = false;
let posSliderTempValue = 0;
OnSeekChange.push((seek) => {
    if (isPosSliderMouseDown) return;
    updateSliderPos(seek)
})



$('#audio-controls-slider').on('mousemove', (e) => {
    let slider = e.currentTarget
    let preSeek = Responds.Current.duration * e.offsetX / slider.clientWidth
    $('#audio-controls-slider-popuphint').css({
        left: slider.offsetLeft + e.offsetX - 30,
        top: slider.offsetTop - 30
    })
    $('#audio-controls-slider-popuphint').html(duration2string(preSeek))

})

$('#audio-controls-slider').on('mousedown', (e) => {
    let slider = e.currentTarget
    isPosSliderMouseDown = true
})
$('#audio-controls-slider').on('input change', (e) => {
    let slider = e.currentTarget
    posSliderTempValue = slider.value
})
$('input[type="range"]#audio-controls-slider').on('mouseup', (e) => {
    if (!isPosSliderMouseDown) return;
    let slider = e.currentTarget
    isPosSliderMouseDown = false;
    let seeked_value = Responds["Current"].duration * posSliderTempValue / slider.max;
    AppIpc.Send2Audio("Remote", "Seek", seeked_value)
})



$('#audio-controls-volume').on("mouseup", (e) => {
    AppIpc.Send2Audio("Remote", "Volume", e.currentTarget.value / 1000)
})


$('#audio-controls-volume').on('mousewheel', (ev) => {
    AppIpc.Send2Audio("Remote", "Volume", Responds.Volume + ev.originalEvent.wheelDelta/1000)
})
