import setup from "../page-setup";
import {setupTeaserTriggers} from "../visuals";

const {elements} = setup({
    onReady: init,
    requireCanton: false
});

function init() {
    setupTeaserTriggers();
}