import SwissVoiceAPI from "../api";
import setup from "../page-setup";
import {nextRecordText, record} from "../record";
import {nextSample, togglePlay, voteSample} from "../vote";

let cantonsOverlayVisible = false;

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
        "#record-btn": record,
        "#submit-proposed-texts": proposeTexts,
        ".overlay-button-toggler": toggleOverlay
    }
});

export {elements};

function toggleOverlay() {
    if (cantonsOverlayVisible) {
        document.body.style.overflow = "";
        $(".cover").fadeOut("slow");
        $(".popup").fadeOut("slow");
    } else {
        window.scrollTo(0, 0);
        document.body.style.overflow = "hidden";
        $(".cover").fadeIn("slow");
        $(".popup").fadeIn("slow");
    }
    cantonsOverlayVisible = !cantonsOverlayVisible;
}

function displayCantonFlag() {
    elements.overlayButtonTogglers.hide();
    elements.cantonDisplay.attr("src", SwissVoiceAPI.canton().image);
    elements.cantonDisplay.show();
}

function selectCanton(selectedCanton) {
    SwissVoiceAPI.canton(selectedCanton);
    displayCantonFlag();
    toggleOverlay();
}

function displayCantons() {
    const cantons = SwissVoiceAPI.getCantons();
    for (const canton of cantons) {
        const cantonImage = document.createElement("img");
        cantonImage.classList.add("canton-image");
        cantonImage.src = canton.image;
        cantonImage.addEventListener("click", () => selectCanton(canton));
        elements.cantonContainer.append(cantonImage);
    }
}

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