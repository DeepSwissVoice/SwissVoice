let player;
let currentSample;

async function init() {
    await SwissVoiceAPI.setup("test");
    nextSample();
    await SwissVoiceAPI.getRegions();
    fetchCantons();
}

function nextSample() {
    currentSample = SwissVoiceAPI.getSample();
    $("#text_sample_display").text(currentSample.text);
    $("#sample_voting").removeClass("active");
}

function showOverlay(currentState) {
    if (currentState === 1) {
        window.scrollTo(0, 0);
        document.getElementsByTagName("body")[0].style = "overflow: hidden";
        $(".cover").fadeIn("slow");
        $(".popup").fadeIn("slow");
    } else {
        document.getElementsByTagName("body")[0].style = "";
        $(".cover").fadeOut("slow");
        $(".popup").fadeOut("slow");
    }
}

function fetchCantons() {
    const listOfRegions = SwissVoiceAPI.getRegions();
    const listOfCantons = listOfRegions[0].cantons;
    for (let a = 0; a < listOfCantons.length; a++) {
        const cantonName = listOfCantons[a].name;
        const cantonImageSrc = listOfCantons[a].image;
        const cantonImage = document.createElement("img");
        cantonImage.src = cantonImageSrc;
        cantonImage.setAttribute("width", "25%");
        cantonImage.style = "padding: 5px;";
        const cantonNameHandleEventObject = {
            handleEvent: function () {
                saveCanton(this.localCantonName, this.localCantonImageSrc);
            },
            localCantonName: cantonName,
            localCantonImageSrc: cantonImageSrc
        };
        cantonImage.addEventListener("click", cantonNameHandleEventObject, false);
        document.getElementById("imageView").appendChild(cantonImage);
    }
}

function saveCanton(selectedCantonName, selectedCantonImageSrc) {
    localStorage.cantonName = selectedCantonName;
    console.log(localStorage.cantonName); //TODO: Delete after testing
    displayCantonFlag(selectedCantonImageSrc);
    showOverlay(0);
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

$(document).ready(init);
