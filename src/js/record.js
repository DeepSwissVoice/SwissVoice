import AudioWeb from "./audio-web";
import {elements} from "./index";
import SwissVoiceAPI from "./api";

const audioWeb = new AudioWeb();
let currentRecordText;

export function nextRecordText() {
    currentRecordText = SwissVoiceAPI.getText();
    elements.textRecordDisplay.text(currentRecordText.text);
}

function sleep(timeout) {
    return new Promise(res => setTimeout(res, timeout));
}

export async function record() {
    await audioWeb.init();
    const visualiser = $("#record-visualiser");
    audioWeb.setVolumeCallback(volume => requestAnimationFrame(() => visualiser.height(volume)));
    audioWeb.start();
    console.log("recording start");
    await sleep(3000);
    const result = await audioWeb.stop();
    console.log("recording end", result);
    window.location.href = result.url;
}