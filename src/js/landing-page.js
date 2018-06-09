async function init() {
    // This function will be called as soon as the page has been loaded (do whatever you want!)
}

function _init() {
    // If you need to do any initialisation before the page has been properly loaded, put the code in here
    $(init);
}

Raven.config("https://23dcfd51df56440486089720f7184663@sentry.io/1214965", {
    release: VERSION
}).install();
Raven.context(_init);