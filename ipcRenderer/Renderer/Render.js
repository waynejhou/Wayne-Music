function duration2string(duration, sep = ":") {
    let min = ("" + Math.floor(duration / 60)).padStart(2, "0")
    let sec = ("" + Math.floor(duration % 60)).padStart(2, "0")
    return `${min}${sep}${sec}`
}

function updateTitle(title) {
    if (title) {
        $('head > title').html(`${title} - Wayne Music`)
    } else {
        $('head > title').html(`Wayne Music`)
    }
}

function updateAudioInfo(title, album) {
    $('#metadata-title').html(title)
    $('#metadata-album').html(album)
};

function updateDuration(duration) {
    $('#audio-controls-slider-max').each((_, span) => {
        span.innerHTML = duration;
    })
}

function updateCover(picture) {
    $('#metadata-cover').attr('src', picture)
}

function updateCoverBackground(picture) {
    $('#background-cover').css({
        "background-image": `url(${picture})`
    })
}

if (!OnResponds.Current) {
    OnResponds.Current = (audioData) => {
        updateTitle(audioData.title)
        updateAudioInfo(audioData.title, audioData.album)
        updateCover(audioData.picture)
        updateCoverBackground(audioData.picture)
        updateDuration(duration2string(audioData.duration))
    }
}

function updatePlayPauseBtn(playbackState) {
    if (playbackState == 'playback-playing') {
        $("#audio-controls-playpause-btn").html('<i class="fas fa-pause"></i>')
    } else {
        $("#audio-controls-playpause-btn").html('<i class="fas fa-play"></i>')
    };
}

if (!OnResponds.PlaybackState) {
    OnResponds.PlaybackState = (data) => {
        updatePlayPauseBtn(data)
    }
}

function updateRepeatBtn(loopState) {
    if (loopState) {
        $('#audio-controls-repeat-btn').html(
            '<div id="repeat-btn-icon-layout">' +
            '    <i id="repeat-btn-icon" class="unicode-symbol">&#x2B8C;</i>' +
            '    <span id="repeat-btn-addition">1</span>' +
            '</div>'
        )
    } else {
        $('#audio-controls-repeat-btn').html(
            '<i class="unicode-symbol">&#x2B8C;</i>'
        )
    }
}
if (!OnResponds.Loop) {
    OnResponds.Loop = (data) => {
        updateRepeatBtn(data)
    }
}


function getSliderBGCss(percentage, width, hover = false) {
    let offset = width / 2
    let slider_left_color = "var(--main-layer-transparent-d)"
    let slider_right_color = "var(--main-layer-transparent)"
    let slider_left_color_hover = "var(--main-layer-transparent-hover-d)"
    if (!hover) {
        return {
            'background':
                `linear-gradient(` +
                `to right, ` +
                `${slider_left_color}, ` +
                `${slider_left_color} ${percentage - offset}%, ` +
                `${slider_right_color} ${percentage + offset}%, ` +
                `${slider_right_color})`
        }
    } else {
        return {
            'background':
                `linear-gradient(` +
                `to right, ` +
                `${slider_left_color_hover}, ` +
                `${slider_left_color_hover} ${percentage - offset}%, ` +
                `${slider_right_color} ${percentage + offset}%, ` +
                `${slider_right_color})`
        }

    }
}
let isMouseInPosSlider = false;
$('#audio-controls-slider').on('mouseenter', () => {
    let slider = $('#audio-controls-slider')[0]
    isMouseInPosSlider = true
    $('#audio-controls-slider').css(getSliderBGCss(slider.value / slider.max * 100, 10, hover = true))
})
$('#audio-controls-slider').on('mouseleave', () => {
    let slider = $('#audio-controls-slider')[0]
    isMouseInPosSlider = false
    $('#audio-controls-slider').css(getSliderBGCss(slider.value / slider.max * 100, 10))
})
function updateSliderPos(seek) {
    $('#audio-controls-slider').each((_, slider) => {
        slider.value = seek * slider.max / Responds["Current"].duration
    });
    let slider = $('#audio-controls-slider')[0]
    if (!isMouseInPosSlider) {
        $('#audio-controls-slider').css(getSliderBGCss(slider.value / slider.max * 100, 4))
    } else {
        $('#audio-controls-slider:hover').css(getSliderBGCss(slider.value / slider.max * 100, 4, hover = true))
    }
    $('#audio-controls-slider-value').each((_, span) => {
        span.innerHTML = duration2string(Responds.Seek)
    })
}
if (!OnResponds.Seek) {
    OnResponds.Seek = (data) => {
        updateSliderPos(data)
    }
}


let isMouseInVolumeSlider = false
$('#audio-controls-volume').on('mouseenter', () => {
    let slider = $('#audio-controls-volume')[0]
    isMouseInVolumeSlider = true
    $('#audio-controls-volume').css(getSliderBGCss(slider.value / slider.max * 100, 10, hover = true))
})
$('#audio-controls-volume').on('mouseleave', () => {
    let slider = $('#audio-controls-volume')[0]
    isMouseInVolumeSlider = false
    $('#audio-controls-volume').css(getSliderBGCss(slider.value / slider.max * 100, 10))
})
function updateVolume(volume) {
    $('#audio-controls-volume').each((_, slider) => {
        slider.value = volume * 1000
    });
    if (isMouseInVolumeSlider) {
        $('#audio-controls-volume').css(getSliderBGCss(volume * 100, 10, hover = true))
    } else {
        $('#audio-controls-volume').css(getSliderBGCss(volume * 100, 10))
    }
}
if (!OnResponds.Volume) {
    OnResponds.Volume = (data) => {
        updateVolume(data)
    }
}