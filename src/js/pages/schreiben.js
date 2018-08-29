import SwissVoiceAPI from "../api";
import setup from "../page-setup";
import {firstCharUpperCase, sleep} from "../utils";

const {elements} = setup({
    onReady: showProposedText,
    elements: {
        proposeTextsInput: "#textarea-input",
        proposedTextDisplay: "#proposed-text-display",
        voteSystem: "#vote-system",
        writeBtn: "#slider-write-btn",
        voteBtn: "#slider-vote-btn"
    },
    buttons: {
        "#send-text": proposeTexts,
        "#vote-text-true-btn": () => voteText(true),
        "#vote-text-false-btn": () => voteText(false),
        ".slider-btn": toggleSlider,
        ".toggle-guidance": toggleUserGuidance

    }
});

class StepCounter {
    constructor(totalSteps) {
        this.totalSteps = totalSteps;
        this.reset();
        this.status = true;
    }

    step() {
        if (this.status == true) {
            if (this.currentStep >= this.totalSteps) {
                this.reset()
            }

            this.currentStep++;

            $(".slide-active").find(`.tick-${this.currentStep}`).parent().addClass("done");
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
}

async function voteText(isCorrect) {
    await SwissVoiceAPI.voteProposed(isCorrect);
    voteCounter.step();

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
}

function toggleUserGuidance() {
    $(".toggle-guidance").toggleClass("off");
    $(".step-bar").toggleClass("off");
    voteCounter.toggleOnOff();
    proposalCounter.toggleOnOff();
}
