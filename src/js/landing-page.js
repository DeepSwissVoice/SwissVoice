import $ from "jquery";
import Raven from "raven-js";


async function init() {
    // This function will be called as soon as the page has been loaded (do whatever you want!)
    loadingAnimation();
}

function _init() {
    // If you need to do any initialisation before the page has been properly loaded, put the code in here
    setInfoTextHeight()
    $(init);
}


function loadingAnimation() {
    setTimeout(() => $(".fly-text").removeClass("off"), 500);
    setTimeout(() => {
        setTimeout(() => $(".fly-text li").addClass("fade-out"), 1000);
        $('.logo-screen').addClass('fade-out');
        setTimeout(() => {
          $('.logo-screen').removeClass('fade-out');
          $('.logo-screen').addClass('loaded');
        },1000);
    }, 3000);
}
/* something breaks everything here... someone help plz?
function setInfoTextHeight() {
  if (window.innerWidth > 575) {
    $('#sv-info-tx1').height($('#sv-info-tx2').height());
  } else {
    $('#sv-info-tx1').height(300));
  }
}
*/
Raven.config("https://23dcfd51df56440486089720f7184663@sentry.io/1214965", {
    release: VERSION
}).install();
Raven.context(_init);
