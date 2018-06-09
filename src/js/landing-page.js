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
    setTimeout(function() {$('fly-text').removeClass('hidden')}, 500);
    setTimeout(function() {
    $('.loading-screen').addClass('loaded');
    $('.fly-text').addClass('loaded')}, 2800);
}



Raven.config("https://23dcfd51df56440486089720f7184663@sentry.io/1214965", {
    release: VERSION
}).install();
Raven.context(_init);
