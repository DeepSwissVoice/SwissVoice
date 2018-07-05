import(/* webpackChunkName: "bootstrap" */ "bootstrap");

import setup from "../page-setup";

const {elements} = setup({
    onReady: init,
    requireCanton: false,
    elements: {

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

async function init() {
    
}
