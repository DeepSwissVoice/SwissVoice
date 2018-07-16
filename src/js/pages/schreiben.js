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
        ".slider-btn": toggleSlider
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
}

async function voteText(isCorrect) {
    await SwissVoiceAPI.voteProposed(isCorrect);
    showProposedText();
}

function showProposedText() {
    const textSample = SwissVoiceAPI.getProposedText();
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
