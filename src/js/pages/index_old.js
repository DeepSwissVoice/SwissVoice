import setup from "../page-setup";
import {nextRecordText, record} from "../record";
import {nextSample, togglePlay, voteSample} from "../vote";

const {elements} = setup({
    onReady: init,
    elements: {
        cantonContainer: "#image-view",
        cantonDisplay: "#current-canton-image",
        textRecordDisplay: "#text-record-display",
        voteSampleButtons: "#vote-sample-true-btn, #vote-sample-false-btn",
        textSampleDisplay: "#text-sample-display",
        proposeTextsInput: "#propose-texts-input",
        overlayButtonTogglers: ".overlay-button-toggler"
    },
    buttons: {
        "#toggle-play-btn": togglePlay,
        "#vote-sample-true-btn": () => voteSample(true),
        "#vote-sample-false-btn": () => voteSample(false),
        "#record-btn": record
    }
});

export {elements};

function init() {
    nextSample();
    nextRecordText();
}