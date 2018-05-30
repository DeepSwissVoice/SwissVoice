import "bootstrap";
import $ from "jquery";
import Raven from "raven-js";

import SwissVoiceAPI from "./api";
import {record} from "./record";

export const elements = {};

let currentRegionId;

let cantonsOverlayVisible = false;

function toggleOverlay() {
    if (!cantonsOverlayVisible) {
        window.scrollTo(0, 0);
        document.getElementsByTagName("body")[0].style = "overflow: hidden";
        $(".cover").fadeIn("slow");
        $(".popup").fadeIn("slow");
    } else {
        document.getElementsByTagName("body")[0].style = "";
        $(".cover").fadeOut("slow");
        $(".popup").fadeOut("slow");
    }
    cantonsOverlayVisible = !cantonsOverlayVisible;
}

function displayCantons() {
    const cantonContainer = document.getElementById("imageView");
    const cantons = SwissVoiceAPI.getCantons();
    for (const canton of cantons) {
        const cantonImage = document.createElement("img");
        cantonImage.classList.add("canton-image");
        cantonImage.src = canton.image;
        cantonImage.addEventListener("click", () => selectCanton(canton));

        cantonContainer.appendChild(cantonImage);
    }
}

function selectCanton(canton) {
    currentRegionId = canton.region;
    localStorage.setItem("region", currentRegionId);
    displayCantonFlag(canton.image);
    toggleOverlay();
}

function displayCantonFlag(selectedCantonImageSrc) {
    document.getElementById("current-canton-image").src = selectedCantonImageSrc;
    document.getElementById("current-canton-image").hidden = false;
}

let player;
let currentSample;

function nextSample() {
    currentSample = SwissVoiceAPI.getSample();
    $("#text-sample-display").text(currentSample.text);
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

function togglePlay() {
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

function voteSample(opinion) {
    if (currentSample && !elements.voteSampleButtons.hasClass("disabled")) {
        SwissVoiceAPI.approveSample(opinion);
        nextSample();
    }
}


const btnMapping = {
    "show-overlay-btn": toggleOverlay,
    "cover": toggleOverlay,
    "toggle-play-btn": togglePlay,
    "vote-sample-true-btn": () => voteSample(true),
    "vote-sample-false-btn": () => voteSample(false),
    "record-btn": record
};

const elQueryMapping = {
    "voteSampleButtons": "#vote-sample-true-btn, #vote-sample-false-btn"
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
    if (SwissVoiceAPI.ready) {
        await SwissVoiceAPI.ready;

        nextSample();
    } else {
        alert("Api isn't setup yet...");
    }
    await SwissVoiceAPI.getRegions();
    displayCantons();
}

function _init() {
    currentRegionId = localStorage.getItem("region");
    if (currentRegionId) {
        SwissVoiceAPI.setup(currentRegionId);
    }

    $(init);
}

Raven.config("https://23dcfd51df56440486089720f7184663@sentry.io/1214965", {
    release: VERSION
}).install();
Raven.context(_init);
