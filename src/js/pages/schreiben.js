import SwissVoiceAPI from "../api";
import setup from "../page-setup";
import {firstCharUpperCase, sleep} from "../utils";

let currCounterStep = 0;

const {elements} = setup({
    onReady: showProposedText,
    elements: {
        proposeTextsInput: "#textarea-input",
        proposedTextDisplay: "#proposed-text-display",
        voteSystem: "#vote-system",
        writeBtn: "#slider-write-btn",
        voteBtn: "#slider-vote-btn",
        stepCounter: ".step-counter"
    },
    buttons: {
        "#send-text": proposeTexts,
        "#vote-text-true-btn": () => voteText(true),
        "#vote-text-false-btn": () => voteText(false),
        ".slider-btn": toggleSlider,
        ".end-guidance i": endStepCounter

    }
});

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
    stepCounter(3);
}

async function voteText(isCorrect) {
    await SwissVoiceAPI.voteProposed(isCorrect);
    stepCounter(5);
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

async function endStepCounter() {
    elements.stepCounter.addClass("closed");
}

function toggleSlider(event) {
    $(".slide-active").removeClass("slide-active");
    $(".slider-btn.active").removeClass("active");
    const btn = event.target;
    btn.classList.add("active");
    const target = document.querySelector(btn.dataset.target);
    target.classList.add("slide-active");
}

function stepCounter(maxSteps) {
    currCounterStep++;
    if (currCounterStep == maxSteps) {
        $(`.tick-${currCounterStep}`).parent().addClass("done");
        endStepCounter();
        currCounterStep = 0;
    } else {
        $(`.tick-${currCounterStep}`).parent().addClass("done");
    }
}
