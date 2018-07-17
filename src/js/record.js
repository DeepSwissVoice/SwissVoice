import AudioWeb from "./lib/audio-web";
import {elements} from "./pages/index_old";
import SwissVoiceAPI from "./api";

import {sleep} from "./utils";

const audioWeb = new AudioWeb();
let currentRecordText;

export async function nextRecordText() {
    currentRecordText = await SwissVoiceAPI.getText();
    if (!currentRecordText) {
        alert("There aren't any texts left...");
        return;
    }
    elements.textRecordDisplay.text(currentRecordText.text);
}

export async function record() {
    await audioWeb.init();
    const visualiser = $("#record-visualiser");
    audioWeb.setVolumeCallback((volume) => requestAnimationFrame(() => visualiser.height(volume)));
    audioWeb.start();
    console.log("recording start");
    await sleep(3000);
    const result = await audioWeb.stop();
    console.log("recording end", result);
    await SwissVoiceAPI.uploadSample(result.blob);
}