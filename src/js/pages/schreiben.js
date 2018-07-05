import SwissVoiceAPI from "../api";
import setup from "../page-setup";
import {sleep} from "../utils";

const {elements} = setup({
    onReady: showProposedText,
    elements: {
        proposeTextsInput: "#textarea-input",
        proposedTextDisplay: "#proposed-text-display"
    },
    buttons: {
        "#send-text": proposeTexts,
        "#vote-text-true-btn": () => voteText(true),
        "#vote-text-false-btn": () => voteText(false)
    }
});


function firstLetterUppercase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function proposeTexts() {
    const content = elements.proposeTextsInput.val();
    const texts = content.split(";").map((s) => s.trim());
    for (let text of texts) {
        if (!text.match(/\w([?!.])$/g)) {
            elements.proposeTextsInput.val("Bitte das Satzzeichen korrigieren");
            await sleep(500);
            elements.proposeTextsInput.val(texts);
            return;
        }
        let text = firstLetterUppercase (text);
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
    const text = SwissVoiceAPI.getProposedText().text;
    elements.proposedTextDisplay.text(text);
}
