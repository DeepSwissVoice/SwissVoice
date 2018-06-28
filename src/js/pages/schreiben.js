import SwissVoiceAPI from "../api";
import setup from "../page-setup";

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
    if (texts.slice(-1) === "." || "!" || "?"){
    const result = await SwissVoiceAPI.proposeTexts(...texts);
    elements.proposeTextsInput.val('');
    console.log(result);
    } else {
        elements.proposeTextsInput.val('Bitte das Satzzeichen korrigieren');
        await sleep(500);
        elements.proposeTextsInput.val(texts);
    }
}
