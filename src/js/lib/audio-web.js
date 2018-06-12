const AUDIO_TYPE = "audio/ogg; codecs=opus";

// interface BlobEvent extends Event {
//   data: Blob;
// }

export const AudioError = {
    NOT_ALLOWED: "NOT_ALLOWED",
    NO_MIC: "NO_MIC",
    NO_SUPPORT: "NO_SUPPORT"
};


export default class AudioWeb {
    constructor() {
        this.visualize = this.visualize.bind(this);
    }

    isReady() {
        return !!this.microphone;
    }

    getMicrophone() {
        return new Promise((res, rej) => {
            function deny(error) {
                rej({
                    NotAllowedError: AudioError.NOT_ALLOWED,
                    NotFoundError: AudioError.NO_MIC,
                }[error.name] || error);
            }

            function resolve(stream) {
                res(stream);
            }

            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices
                    .getUserMedia({audio: true})
                    .then(resolve, deny);
            } else if (navigator.getUserMedia) {
                navigator.getUserMedia({audio: true}, resolve, deny);
            } else if (navigator.webkitGetUserMedia) {
                navigator.webkitGetUserMedia({audio: true}, resolve, deny);
            } else if (navigator.mozGetUserMedia) {
                navigator.mozGetUserMedia({audio: true}, resolve, deny);
            } else {
                // Browser does not support getUserMedia
                rej(AudioError.NO_SUPPORT);
            }
        });
    }

    // Check all the browser prefixes for microhpone support.
    isMicrophoneSupported() {
        return (
            (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ||
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia
        );
    }

    // Check if audio recording is supported
    isAudioRecordingSupported() {
        return typeof MediaRecorder !== "undefined";
    }

    visualize() {
        this.analyzerNode.getByteFrequencyData(this.frequencyBins);

        let sum = 0;
        for (let i = 0; i < this.frequencyBins.length; i++) {
            sum += this.frequencyBins[i];
        }

        let average = sum / this.frequencyBins.length;

        if (this.volumeCallback) {
            this.volumeCallback(average);
        }
    }

    startVisualize() {
        this.jsNode.onaudioprocess = this.visualize;
    }

    stopVisualize() {
        this.jsNode.onaudioprocess = undefined;
        if (this.volumeCallback) {
            this.volumeCallback(100);
        }
    }

    setVolumeCallback(cb) {
        this.volumeCallback = cb;
    }

    /**
     * Initialize the recorder, opening the microphone media stream.
     *
     * If microphone access is currently denied, the user is asked to grant
     * access. Since these permission changes take effect only after a reload,
     * the page is reloaded if the user decides to do so.
     *
     */
    async init() {
        if (this.isReady()) {
            return;
        }

        const microphone = await this.getMicrophone();

        this.microphone = microphone;
        const audioContext = new AudioContext();
        const sourceNode = audioContext.createMediaStreamSource(microphone);
        const volumeNode = audioContext.createGain();
        const analyzerNode = audioContext.createAnalyser();
        const outputNode = audioContext.createMediaStreamDestination();

        // Make sure we're doing mono everywhere.
        sourceNode.channelCount = 1;
        volumeNode.channelCount = 1;
        analyzerNode.channelCount = 1;
        outputNode.channelCount = 1;

        // Connect the nodes together
        sourceNode.connect(volumeNode);
        volumeNode.connect(analyzerNode);
        analyzerNode.connect(outputNode);

        // and set up the recorder.
        this.recorder = new MediaRecorder(outputNode.stream);

        // Set up the analyzer node, and allocate an array for its data
        // FFT size 64 gives us 32 bins. But those bins hold frequencies up to
        // 22kHz or more, and we only care about visualizing lower frequencies
        // which is where most human voice lies, so we use fewer bins
        analyzerNode.fftSize = 128;
        analyzerNode.smoothingTimeConstant = 0.96;
        this.frequencyBins = new Uint8Array(analyzerNode.frequencyBinCount);

        // Setup audio visualizer.
        this.jsNode = audioContext.createScriptProcessor(256, 1, 1);
        this.jsNode.connect(audioContext.destination);

        // Another audio node used by the beep() function
        const beeperVolume = audioContext.createGain();
        beeperVolume.connect(audioContext.destination);

        this.analyzerNode = analyzerNode;
        this.audioContext = audioContext;
    }

    start() {
        if (!this.isReady()) {
            throw new Error("Cannot record audio before microhphone is ready.");
        }

        return new Promise(res => {
            this.chunks = [];
            this.recorder.ondataavailable = (e) => {
                this.chunks.push(e.data);
            };

            this.recorder.onstart = (e) => {
                this.clear();
                res();
            };

            // We want to be able to record up to 60s of audio in a single blob.
            // Without this argument to start(), Chrome will call dataavailable
            // very frequently.
            this.startVisualize();
            this.recorder.start(20000);
        });
    }

    stop() {
        if (!this.isReady()) {
            console.error("Cannot stop audio before microhphone is ready.");
            return Promise.resolve({});
        }

        return new Promise(res => {
            this.stopVisualize();

            this.recorder.onstop = () => {
                let blob = new Blob(this.chunks, {type: AUDIO_TYPE});
                this.last = {
                    url: URL.createObjectURL(blob),
                    blob: blob,
                };
                res(this.last);
            };
            this.recorder.stop();
        });
    }

    release() {
        if (this.microphone) {
            for (const track of this.microphone.getTracks()) {
                track.stop();
            }
        }
        this.microphone = null;
    }

    clear() {
        if (this.lastRecordingUrl) {
            URL.revokeObjectURL(this.lastRecordingUrl);
        }

        this.lastRecordingData = null;
        this.lastRecordingUrl = null;
    }
}