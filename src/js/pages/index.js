import setup from "../page-setup";
import {sleep} from "../utils";

const {elements} = setup({
    onReady: init,
    elements: {
        flyText: ".fly-text",
        flyTextLi: ".fly-text li",
        logoScreen: ".logo-screen",
        bgLogoScreen: "#bg-loading-screen",
        footerArea: "#footer-area"
    },
    buttons: {
        ".teaser-trigger": (event) => {
            const target = $(event.delegateTarget).prev();
            if (target.hasClass("teaser")) {
                target.attr("data-height", target.height());
                target.height(target.prop("scrollHeight"));
            } else {
                target.height(target.attr("data-height"));
            }
            target.toggleClass("teaser");
        }
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

async function init() {
    await loadingAnimation();
}
