userType = "R"
ServerIP = "http://54.212.218.84:2521/ravel/1.0"
loginObj = {}
estateSelected = 0
directory = "condo"


captureCfg = {
    sampleRate: 44100,
    bufferSize: 16384,
    channels: 1,
    format: "PCM_16BIT",
    normalize: true,
    normalizationFactor: 32767,
    streamToWebAudio: false,
    audioContext: null,
    concatenateMaxChunks: 10,
    audioSourceType: 0
    
};

//db.upsert("loginInfo",{ estates : [{ guestId : "ef74ab1308edc737de7daac980220ec7"}]})