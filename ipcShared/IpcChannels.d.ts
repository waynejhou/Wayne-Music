export enum IpcChannels {
    // wss message incoming
    wss_message_incoming = "wss-message-incoming",
    
    // audio file channels
    audio_change_src = "audio-change-src",
    audio_add_src = "audio-add-src",


    audio_query_current = "audio-query-Current",
    audio_respond_current = "audio-respond-Current",
    audio_remote_current = "audio-remote-Current",

    // playback channels
    audio_remote_playbackState = "audio-remote-PlaybackState",
    audio_query_playbackState = "audio-query-PlaybackState",
    audio_respond_playbackState = "audio-respond-PlaybackState",
    // seek channels
    audio_query_seek = "audio-query-Seek",
    audio_respond_seek = "audio-respond-Seek",
    audio_remote_seek = "audio-remote-Seek",

    // loop channels
    audio_query_loop = "audio-query-Loop",
    audio_respond_loop = "audio-respond-Loop",
    audio_remote_loop = "audio-remote-Loop",

    // currentlist
    audio_query_currentlist= "audio-query-CurrentList",
    audio_respond_currentlist= "audio-respond-CurrentList",
    audio_remote_currentlist= "audio-remote-CurrentList",

}