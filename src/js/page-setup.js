import $ from "jquery";
import SwissVoiceAPI from "./api";
import Raven from "raven-js";

export default function setup(options) {
    options = Object.assign({setupAPI: true}, options);
    const elements = {};

    function setupPage(elements, buttons) {
        if (elements) {
            for (const [id, selector] of Object.entries(elements)) {
                elements[id] = $(selector);
            }
        }
        if (buttons) {
            for (const [selector, listener] of Object.entries(buttons)) {
                $(selector).click(listener);
            }
        }
    }

    async function init() {
        setupPage(options.elements, options.buttons);
        if (options.setupAPI) {
            await SwissVoiceAPI.ready;
        }
        if (options.onReady) {
            options.onReady();
        }
    }

    function _init() {
        if (options.setupAPI) {
            SwissVoiceAPI.setup();
        }
        if (options.onBeforeLoad) {
            options.onBeforeLoad();
        }
        $(init);
    }

    Raven.config("https://23dcfd51df56440486089720f7184663@sentry.io/1214965", {
        release: VERSION
    }).install();
    Raven.context(_init);

    return {elements};
}