import "bootstrap";
import $ from "jquery";
import Raven from "raven-js";

import SwissVoiceAPI from "./api";
import {nextRecordText, record} from "./record";
import {nextSample, togglePlay, voteSample} from "./vote";

export const elements = {};

let currentCanton;
let cantonsOverlayVisible = false;

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

function selectCanton(selectedCanton) {
    currentCanton = selectedCanton;
    localStorage.setItem("canton", JSON.stringify(currentCanton));
    displayCantonFlag();
    toggleOverlay();
}

function displayCantonFlag() {
<<<<<<< HEAD
    document.getElementById("show-overlay-btn").style.display = "none";
    document.getElementById("record-show-overlay-btn").style.display = "none";
    document.getElementById("play-show-overlay-btn").style.display = "none";
=======
    $("#show-overlay-btn").hide();
>>>>>>> c31770da055f02ceba13ea723267fc56e6e68edc
    elements.cantonDisplay.attr("src", currentCanton.image);
    elements.cantonDisplay.show();
}

async function proposeTexts() {
    const content = elements.proposeTextsInput.val();
    const texts = content.split(";").map(s => s.trim());
    const result = await SwissVoiceAPI.proposeTexts(...texts);
    console.log(result);
}


const btnMapping = {
    "show-overlay-btn": toggleOverlay,
    "current-canton-image": toggleOverlay,
    "special-show-overlay-btn": toggleOverlay,
    "cover": toggleOverlay,
    "toggle-play-btn": togglePlay,
    "vote-sample-true-btn": () => voteSample(true),
    "vote-sample-false-btn": () => voteSample(false),
    "record-btn": record,
    "submit-proposed-texts": proposeTexts
};

const elQueryMapping = {
    "cantonContainer": "#image-view",
    "cantonDisplay": "#current-canton-image",
    "textRecordDisplay": "#text-record-display",
    "voteSampleButtons": "#vote-sample-true-btn, #vote-sample-false-btn",
    "textSampleDisplay": "#text-sample-display",
    "proposeTextsInput": "#propose-texts-input"
};

function setupPage() {
    for (const [id, listener] of Object.entries(btnMapping)) {
        document.getElementById(id).addEventListener("click", listener);
    }

    for (const [id, selector] of Object.entries(elQueryMapping)) {
        elements[id] = $(selector);
    }
}

async function init() {
    setupPage();

    await SwissVoiceAPI.ready;
    if (SwissVoiceAPI.region()) {
        displayCantonFlag();
        nextSample();
        nextRecordText();
    } else {
        alert("Api isn't setup yet...");
    }
    await SwissVoiceAPI.getRegions();
    displayCantons();
}

function _init() {
    currentCanton = JSON.parse(localStorage.getItem("canton"));
    if (currentCanton) {
        SwissVoiceAPI.setup(currentCanton.region);
    } else {
        SwissVoiceAPI.setup();
    }

    $(init);
}

Raven.config("https://23dcfd51df56440486089720f7184663@sentry.io/1214965", {
    release: VERSION
}).install();
Raven.context(_init);
