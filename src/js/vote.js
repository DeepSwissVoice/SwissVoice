import {elements} from "./index";
import SwissVoiceAPI from "./api";

let player;
let currentSample;

export function nextSample() {
    currentSample = SwissVoiceAPI.getSample();
    elements.textSampleDisplay.text(currentSample.text);
    elements.voteSampleButtons.addClass("disabled");
}

function getSample() {
    if (!currentSample) {
        nextSample();
    }
    return currentSample;
}

function onAudioEnd() {
    elements.voteSampleButtons.removeClass("disabled");
    player = null;
}

export function togglePlay() {
    if (player) {
        if (!(player.ended || player.paused)) {
            player.pause();
        }
        player = null;
    } else {
        const sample = getSample();
        player = new Audio(sample.location);
        player.addEventListener("ended", onAudioEnd);
        player.play();
    }
}

export function voteSample(opinion) {
    if (currentSample && !elements.voteSampleButtons.hasClass("disabled")) {
        SwissVoiceAPI.approveSample(opinion);
        nextSample();
    }
}