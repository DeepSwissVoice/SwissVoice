import SwissVoiceAPI from "../api";
import setup from "../page-setup";

const {elements} = setup({
    elements: {
        proposeTextsInput: "#propose-texts-input",
    },
    buttons: {
        "#submit-proposed-texts": proposeTexts
    }
});


async function proposeTexts() {
    const content = elements.proposeTextsInput.val();
    const texts = content.split(";").map((s) => s.trim());
    const result = await SwissVoiceAPI.proposeTexts(...texts);
    console.log(result);
}
