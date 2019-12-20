$('button#page-changing-cover').click(() => {
    $('#body-container').load('cover')
})

$('button#page-changing-list').click(() => {
    $('#body-container').load('list')
})

$('#audio-controls-playpause-btn').click(() => {
    if (Responds["PlaybackState"] == 'playing') {
        AppIpc.Send2Audio("Remote", "PlaybackState", 'paused')
    }
    else {
        AppIpc.Send2Audio("Remote", "PlaybackState", 'playing')
    }
});

$('#audio-controls-repeat-btn').click(() => {
    let loop = !Responds["Loop"]
    AppIpc.Send2Audio("Remote", "Loop", loop)
});

let isPosSliderMouseDown = false;
let posSliderTempValue = 0;
window.setInterval(() => {
    if (Responds["PlaybackState"] != 'playing') return
    if (isPosSliderMouseDown) return;
    Responds.Seek += 0.033
    updateSliderPos(Responds.Seek)
}, 33);

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