import SwissVoiceAPI from "../api";
import setup from "../page-setup";
import {firstCharUpperCase, sleep} from "../utils";

let currentActiveSlide = "proposal";

const {elements} = setup({
    onReady: showProposedText,
    elements: {
        proposeTextsInput: "#textarea-input",
        proposedTextDisplay: "#proposed-text-display",
        voteSystem: "#vote-system",
        proposalBtn: "#slider-proposal-btn",
        voteBtn: "#slider-vote-btn"
    },
    buttons: {
        "#send-text": proposeTexts,
        "#vote-text-true-btn": () => voteText(true),
        "#vote-text-false-btn": () => voteText(false),
        ".slider-btn": toggleSlider,
        ".toggle-guidance": toggleUserGuidance,
        "#schreiben-next-btn":() => nextStepInGuide("proposal"),
        "#bewerten-next-btn":() => nextStepInGuide("vote"),
        ".cover-circle-overlay":() => nextStepInGuide(currentActiveSlide)
    }
});

class ScoreCounter {
    constructor(storageName) {
        this.storageName = storageName;
        this.totalScore;
        this.getCurrentScore();
    }

    updateStorage() {
        localStorage.setItem(this.storageName, this.totalScore);
    }

    increaseScore(increaseRate) {
        this.totalScore += increaseRate;
        updateStorage();
    }

    getCurrentScore() {
        if (localStorage.hasOwnProperty(this.storageName)) {
            this.totalScore = localStorage.getItem(this.storageName);
            return this.totalScore;
        } else {
            this.totalScore = 0;
            localStorage.setItem(this.storageName, this.totalScore);
            return this.totalScore;
        }
    }
}

const proposalStorage = new ScoreCounter("proposal");
const voteStorage = new ScoreCounter("vote");

class StepCounter {
    constructor(totalSteps) {
        this.totalSteps = totalSteps;
        this.reset();
        this.status = true;
    }

    step() {
        if (this.status == true) {
            if (this.currentStep >= this.totalSteps) {
                this.reset();
            }

            this.currentStep++;

            $(".slide-active").find(`.tick-${this.currentStep}`).parent().addClass("done");
        }
    }

    isStepCounterFull() {
        if (this.currentStep == this.totalSteps) {
            return true;
        } else {
            return false;
        }
    }

    reset() {
        this.currentStep = 0;
        $(".slide-active").find(`.circle`).removeClass("done");
    }

    toggleOnOff() {
        this.status = !this.status;
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
    if (proposalCounter.isStepCounterFull()) {
        toggleOverlayCircle("proposal");
    }
}

async function voteText(isCorrect) {
    await SwissVoiceAPI.voteProposed(isCorrect);
    voteCounter.step();
    if (voteCounter.isStepCounterFull()) {
        toggleOverlayCircle("vote");
    }

    await showProposedText();
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

function toggleSlider(event) {
    $(".slide-active").removeClass("slide-active");
    $(".slider-btn.active").removeClass("active");
    const btn = event.target;
    btn.classList.add("active");
    const target = document.querySelector(btn.dataset.target);
    target.classList.add("slide-active");
    currentActiveSlide = toggleString(currentActiveSlide, "proposal", "vote");
}

function toggleString(variable, string1, string2 ) {
    if (variable == string1) {
        return string2;
    } else {
        return string1;
    }
}

function toggleUserGuidance() {
    $(".toggle-guidance").toggleClass("off");
    $(".step-bar").toggleClass("off");
    voteCounter.toggleOnOff();
    proposalCounter.toggleOnOff();
    $(".overlay-circle").addClass("off");
    if (!$(".cover-circle-overlay").hasClass("off")) {
        $(".cover-circle-overlay").addClass("off")
    }
}

async function toggleOverlayCircle() {
    $(".vote-count").text(voteStorage.getCurrentScore());
    $(".proposal-count").text(proposalStorage.getCurrentScore());
    $(".overlay-circle").toggleClass("off");
    $(".cover-circle-overlay").toggleClass("off")
}

function nextStepInGuide(currNameOfBar) {
    toggleOverlayCircle();

    if (currNameOfBar == "proposal") {
        proposalCounter.reset();
        elements.voteBtn.click();
    }

    if (currNameOfBar == "vote") {
        voteCounter.reset();
        elements.proposalBtn.click();
    }
}
