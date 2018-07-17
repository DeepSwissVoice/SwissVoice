import {elements} from "./pages/index_old";
import SwissVoiceAPI from "./api";

let player;
let currentSample;

export async function nextSample() {
    currentSample = await SwissVoiceAPI.getSample();
    if (!currentSample) {
        alert("There aren't any samples left...");
        return;
    }
    elements.textSampleDisplay.text(currentSample.text);
    elements.voteSampleButtons.addClass("disabled");
}

async function getSample() {
    if (!currentSample) {
        await nextSample();
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

export async function voteSample(opinion) {
    if (currentSample && !elements.voteSampleButtons.hasClass("disabled")) {
        SwissVoiceAPI.approveSample(opinion);
        await nextSample();
    }
}