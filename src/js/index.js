import "bootstrap";
import $ from "jquery";
import Raven from "raven-js";

import {SwissVoiceAPI} from "./api";

const elements = {};

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
    document.getElementById("current-canton-image").hidden = "";
}

let player;
let currentSample;

function nextSample() {
    currentSample = SwissVoiceAPI.getSample();
    $("#text_sample_display").text(currentSample.text);
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
        player.pause();
        player = null;
        return;
    }
    const sample = getSample();
    player = new Audio(sample.location);
    player.addEventListener("ended", onAudioEnd);
    player.play();
}

function voteSample(opinion) {
    if (currentSample && !elements.voteSampleButtons.hasClass("disabled")) {
        SwissVoiceAPI.approveSample(opinion);
        nextSample();
    }
}


const btnMapping = {
    "show_overlay_btn": toggleOverlay,
    "cover": toggleOverlay,
    "toggle_play_btn": togglePlay,
    "vote_sample_true_btn": () => voteSample(true),
    "vote_sample_false_btn": () => voteSample(false)
};

const elQueryMapping = {
    "voteSampleButtons": "#vote_sample_true_btn, #vote_sample_false_btn"
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

    nextSample();
    await SwissVoiceAPI.getRegions();
    displayCantons();
}

function _init() {
    currentRegionId = localStorage.getItem("region");
    if (!currentRegionId) {
        alert("No region key found in your local storage... Using \"test\" until someone fixes this shit");
        currentRegionId = "TestRegion";
    }

    SwissVoiceAPI.setup(currentRegionId);
    $(init);
}

Raven.config("https://23dcfd51df56440486089720f7184663@sentry.io/1214965").install();
Raven.context(_init);
