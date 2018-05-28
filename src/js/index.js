import {SwissVoiceAPI} from "./api"
import $ from "jquery";
import Raven from "raven-js";

let currentRegionId;

let player;
let currentSample;

function nextSample() {
    currentSample = SwissVoiceAPI.getSample();
    $("#text_sample_display").text(currentSample.text);
    $("#sample_voting").removeClass("active");
}

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

function fetchCantons() {
    const cantonContainer = document.getElementById("imageView");
    const cantons = SwissVoiceAPI.getCantons();
    for (const canton of cantons) {
        const cantonImage = document.createElement("img");
        cantonImage.classList.add("canton_image"); // Here, I already added the class :3 (remove this line asap)
        cantonImage.src = canton.image;
        //
        // cantonImage.setAttribute("width", "25%"); // TODO do these with css, not with javascript!! ( by adding a class to the image and then styling them)
        // cantonImage.style = "padding: 5px;"; //      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        //
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
    document.getElementById("currentCantonImage").src = selectedCantonImageSrc;
    document.getElementById("currentCantonImage").hidden = "";
}

function getSample() {
    if (!currentSample) {
        nextSample();
    }
    return currentSample;
}

function onAudioEnd() {
    $("#sample_voting").addClass("active");
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
    if (currentSample && $("#sample_voting").hasClass("active")) {
        SwissVoiceAPI.approveSample(opinion);
        nextSample();
    }
}


const btnMapping = {
    "show_overlay_btn": toggleOverlay,
    "toggle_play_btn": togglePlay,
    "vote_sample_true_btn": () => voteSample(true),
    "vote_sample_false_btn": () => voteSample(false)
};

function setupPage() {
    for (const [id, listener] of Object.entries(btnMapping)) {
        document.getElementById(id).addEventListener("click", listener);
    }
}

async function init() {
    setupPage();
    await SwissVoiceAPI.ready;

    nextSample();
    await SwissVoiceAPI.getRegions();
    fetchCantons();
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
