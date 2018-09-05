import SwissVoiceAPI from "../api";
import setup from "../page-setup";
import {firstCharUpperCase, sleep} from "../utils";

let currentActiveSlide = "slider-proposal-btn";

const {elements} = setup({
    onReady: showProposedText,
    elements: {
        proposeTextsInput: "#textarea-input",
        proposedTextDisplay: "#proposed-text-display",
        voteSystem: "#vote-system",
        proposalSlideBtn: "#slider-proposal-btn",
        voteSlideBtn: "#slider-vote-btn",
        voteCountDisplay: ".vote-count",
        proposedCountDisplay: ".proposal-count",
        overlayCircle: ".overlay-circle",
        coverCircleOverlay: ".cover-circle-overlay",
        voteTrueBtn: "#vote-text-true-btn",
        voteFalseBtn: "#vote-text-false-btn"
    },
    buttons: {
        "#send-text": proposeTexts,
        "#vote-text-true-btn": () => voteText(true),
        "#vote-text-false-btn": () => voteText(false),
        "#proposal-next-btn": () => nextStepInGuide("slider-proposal-btn"),
        "#vote-next-btn": () => nextStepInGuide("slider-vote-btn"),
        ".slider-btn": toggleSlide,
        ".toggle-guidance": toggleUserGuidance,
        ".cover-circle-overlay":() => nextStepInGuide()
    }
});

class PersistentIntStorage {
    constructor(storageName) {
        this.storageName = storageName;
        this.currentScore = parseInt(localStorage.getItem(storageName)) || 0;
    }

    storeScore() {
        localStorage.setItem(this.storageName, this.currentScore);
    }

    increaseScore(increment) {
        this.currentScore += increment;
        this.storeScore();
    }
}

const proposalStorage = new PersistentIntStorage("proposal");
const voteStorage = new PersistentIntStorage("vote");

class StepCounter {
    constructor(totalSteps) {
        this.totalSteps = totalSteps;
        this.reset();
        this.active = true;
    }

    step() {
        if (this.active) {
            if (this.currentStep >= this.totalSteps) {
                this.reset();
            }

            this.currentStep++;

            $(".slide-active").find(`.tick-${this.currentStep}`).parent().addClass("done");
        }
    }

    isFull() {
        return this.currentStep === this.totalSteps;
    }

    reset() {
        this.currentStep = 0;
        $(".slide-active").find(`.circle`).removeClass("done");
    }

    toggleOnOff() {
        this.active = !this.active;
    }
}

const proposalCounter = new StepCounter(3);
const voteCounter = new StepCounter(5);

async function proposeTexts() {
    const content = elements.proposeTextsInput.val();
    const texts = content.split(";").map((s) => firstCharUpperCase(s.trim()));
    for (let text of texts) {
        if (!text.match(/\w([?!.])$/g)) {
            elements.proposeTextsInput.val("Bitte das Satzzeichen korrigieren");
            await sleep(500);
            elements.proposeTextsInput.val(texts);
            return;
        }
    }

    const result = await SwissVoiceAPI.proposeTexts(...texts);
    elements.proposeTextsInput.val("");
    console.log(result);

    proposalCounter.step();
    if (proposalCounter.isFull()) {
        proposalStorage.increaseScore(3);
        toggleOverlayCircle("proposal");
    }
}

async function showProposedText() {
    const textSample = await SwissVoiceAPI.getProposedText();
    let text;
    if (textSample) {
        text = textSample.text;
    } else {
        text = "Im Moment keine Texte zum bewerten!";
        elements.voteSystem.addClass("no-items");
        elements.voteSystem.find("button").addClass("disabled");
    }

    elements.proposedTextDisplay.text(text);
}

async function voteText(isCorrect) {
    toggleVoteBtns();
    const sleepPromise = sleep(500);
    await SwissVoiceAPI.voteProposed(isCorrect);
    voteCounter.step();
    await sleepPromise;
    toggleVoteBtns();

    if (voteCounter.isFull()) {
        voteStorage.increaseScore(voteCounter.totalSteps);
        toggleOverlayCircle();
    }

    await showProposedText();
}

function toggleSlide(event) {
    const btn = event.target;
    showSlide(btn);
}

function showSlide(btn) {
    console.log("showing slide", btn);
    $(".slide-active").removeClass("slide-active");
    $(".slider-btn.active").removeClass("active");

    btn.classList.add("active");
    const target = document.querySelector(btn.dataset.target);
    target.classList.add("slide-active");

    currentActiveSlide = btn.id;
}

function toggleVoteBtns() {
    elements.voteTrueBtn.toggleClass("disabled");
    elements.voteFalseBtn.toggleClass("disabled");
}

function toggleUserGuidance() {
    $(".toggle-guidance").toggleClass("off");
    $(".step-bar").toggleClass("off");

    voteCounter.toggleOnOff();
    proposalCounter.toggleOnOff();

    elements.overlayCircle.addClass("off");
    elements.coverCircleOverlay.addClass("off");
}

function toggleOverlayCircle() {
    elements.voteCountDisplay.text(voteStorage.currentScore);
    elements.proposedCountDisplay.text(proposalStorage.currentScore);

    elements.coverCircleOverlay.toggleClass("off");
    elements.overlayCircle.toggleClass("off");
}

function nextStepInGuide(currentSlide) {
    toggleOverlayCircle();

    currentSlide = currentSlide || currentActiveSlide;

    switch (currentSlide) {
        case "slider-proposal-btn":
            proposalCounter.reset();
            showSlide(elements.voteSlideBtn[0]);
            break;

        case "slider-vote-btn":
            voteCounter.reset();
            showSlide(elements.proposalSlideBtn[0]);
            break;

        default:
            throw Error("unhandled case for slide = " + currentSlide);
    }
}
