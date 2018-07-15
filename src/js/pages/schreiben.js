import SwissVoiceAPI from "../api";
import setup from "../page-setup";
import {firstCharUpperCase, sleep} from "../utils";

const {elements} = setup({
    onReady: showProposedText,
    elements: {
        proposeTextsInput: "#textarea-input",
        proposedTextDisplay: "#proposed-text-display",
        voteSystem: "#vote-system",
        schreibenBtn: "#slider-schreiben-btn";
        bewertenBtn: "#slider-bewerten-btn",
        schreibenSection: "#propose-text",
        bewertenSection: "#vote-text"
    },
    buttons: {
        "#send-text": proposeTexts,
        "#vote-text-true-btn": () => voteText(true),
        "#vote-text-false-btn": () => voteText(false),
        "#slider-schreiben-btn": () => slider("schreiben"),
        "#slider-bewerten-btn": () => slider("bewerten")
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

async function slider(slide) {
    let curr_slide = "schreiben"
    if (curr_slide == slide) {
        return;
    } else if (slide == "schreiben") {
        elements.bewertenBtn.removeClass("active");
        elements.schreibenBtn.addClass("active");
        elements.bewertenSection.removeClass("slide-active");
        elements.schreibenSection.addClass("slide-active");
        return;
    } else if (slide == "bewerten") {
        elements.schreibenBtn.removeClass("active");
        elements.bewertenBtn.addClass("active");
        elements.schreibenSection.removeClass("slide-active");
        elements.bewertenSection.addClass("slide-active");
        return;
    } else {
        return;
    }

}
