import(/* webpackChunkName: "bootstrap" */ "bootstrap");

import SwissVoiceAPI from "../api";
import setup from "../page-setup";
import {nextRecordText, record} from "../record";
import {nextSample, togglePlay, voteSample} from "../vote";

let cantonsOverlayVisible = false;

const {elements} = setup({
    onReady: init,
    elements: {
        voteSampleButtons: "#vote-sample-true-btn, #vote-sample-false-btn",
        proposeTextsInput: "#propose-texts-input",
    },
    buttons: {
        "#toggle-play-btn": togglePlay,
        "#vote-sample-true-btn": () => voteSample(true),
        "#vote-sample-false-btn": () => voteSample(false),
        "#record-btn": record,
        "#submit-proposed-texts": proposeTexts,
        ".overlay-button-toggler": toggleOverlay
    }
});

export {elements};


async function proposeTexts() {
    const content = elements.proposeTextsInput.val();
    const texts = content.split(";").map((s) => s.trim());
    const result = await SwissVoiceAPI.proposeTexts(...texts);
    console.log(result);
}


async function init() {
    if (SwissVoiceAPI.canton()) {
        displayCantonFlag();
        nextSample();
        nextRecordText();
    } else {
        alert("Api isn't setup yet...");
    }
    displayCantons();
}
