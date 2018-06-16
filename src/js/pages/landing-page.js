import setup from "../page-setup";
import {sleep} from "../utils";

const {elements} = setup({
    onReady: init,
    elements: {
        flyText: ".fly-text",
        flyTextLi: ".fly-text li",
        logoScreen: ".logo-screen",
        bgLogoScreen: "#bg-loading-screen"
    },
    buttons: {
        ".teaser-trigger": (event) => $(event.delegateTarget).prev().toggleClass("teaser")
    }
});

function setInfoTextHeight() {
    // TODO: Css
    // if (window.innerWidth > 575) {
    //     elements.svInfo1.height(elements.svInfo2.height());
    // } else {
    //     elements.svInfo1.height(300);
    // }
}

async function loadingAnimation() {
    elements.bgLogoScreen.addClass("animate-bg");
    await sleep(500);
    elements.flyText.removeClass("off");
    await sleep(3000);
    elements.logoScreen.addClass("fade-out");
    await sleep(1000);
    elements.flyTextLi.addClass("fade-out");
    elements.logoScreen.toggleClass("fade-out loaded");
}

async function init() {
    setInfoTextHeight();
    await loadingAnimation();
}
