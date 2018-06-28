import SwissVoiceAPI from "../api";
import setup from "../page-setup";
import {sleep} from "../utils";

const {elements} = setup({
    elements: {
        proposeTextsInput: "#textarea-input",
    },
    buttons: {
        "#send-text": proposeTexts
    }
});


async function proposeTexts() {
    const content = elements.proposeTextsInput.val();
    const texts = content.split(";").map((s) => s.trim());
    for (const text of texts) {
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
