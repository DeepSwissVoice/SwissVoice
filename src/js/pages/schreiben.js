import SwissVoiceAPI from "../api";
import setup from "../page-setup";
import {firstCharUpperCase, sleep} from "../utils";

let curr_slide = "schreiben";

const {elements} = setup({
    onReady: showProposedText,
    elements: {
        proposeTextsInput: "#textarea-input",
        proposedTextDisplay: "#proposed-text-display",
        voteSystem: "#vote-system",
        writeBtn: "#slider-write-btn",
        voteBtn: "#slider-vote-btn",
        proposeSection: "#propose-text",
        voteSection: "#vote-text"
    },
    buttons: {
        "#send-text": proposeTexts,
        "#vote-text-true-btn": () => voteText(true),
        "#vote-text-false-btn": () => voteText(false),
        "#slider-write-btn": () => slider("schreiben"),
        "#slider-vote-btn": () => slider("bewerten")
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
    if (curr_slide == slide) {

    } else if (slide == "schreiben") {
        elements.voteBtn.removeClass("active");
        elements.writeBtn.addClass("active");
        elements.voteSection.removeClass("slide-active");
        elements.proposeSection.addClass("slide-active");
        curr_slide = "schreiben";

    } else if (slide == "bewerten") {
        elements.writeBtn.removeClass("active");
        elements.voteBtn.addClass("active");
        elements.proposeSection.removeClass("slide-active");
        elements.voteSection.addClass("slide-active");
        curr_slide = "bewerten";

    } else {

    }

}
