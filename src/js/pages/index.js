import setup from "../page-setup";
import {sleep} from "../utils";
import {setupTeaserTriggers} from "../visuals";

const {elements} = setup({
    onLoad: init,
    requireCanton: false,
    elements: {
        flyText: ".fly-text",
        flyTextLi: ".fly-text li",
        logoScreen: ".logo-screen",
        bgLogoScreen: "#bg-loading-screen",
        footerArea: "#footer-area"
    }
});

async function loadingAnimation() {
    elements.footerArea.addClass("footer-off");
    elements.bgLogoScreen.addClass("animate-bg");
    await sleep(500);
    elements.flyText.removeClass("off");
    await sleep(3000);
    elements.logoScreen.addClass("fade-out");
    await sleep(1000);
    elements.flyTextLi.addClass("fade-out");
    elements.logoScreen.toggleClass("fade-out loaded");
    elements.footerArea.removeClass("footer-off");
}

function screenFadeOut() {
    elements.flyTextLi.addClass("fade-out");
    elements.logoScreen.toggleClass("fade-out loaded");
}

async function init() {
    setupTeaserTriggers();
    if (!sessionStorage.hasOwnProperty("loadingAnimation")) {
        sessionStorage.setItem("loadingAnimation", true);
        await loadingAnimation();
    } else {
        screenFadeOut();
    }
}
