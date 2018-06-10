import $ from "jquery";
import Raven from "raven-js";


async function init() {
    // This function will be called as soon as the page has been loaded (do whatever you want!)
    loadingAnimation();
}

function _init() {
    // If you need to do any initialisation before the page has been properly loaded, put the code in here
    $(init);
}


function loadingAnimation() {
    setTimeout(() => $(".fly-text").removeClass("off"), 500);
    setTimeout(() => {
        $(".fly-text li").addClass("loaded");
        setTimeout(() => $('.logo-screen').fadeOut(1000),1000);
        setTimeout(() => $(".logo-screen").addClass("loaded"),1000);
    }, 3000);
}


Raven.config("https://23dcfd51df56440486089720f7184663@sentry.io/1214965", {
    release: VERSION
}).install();
Raven.context(_init);
