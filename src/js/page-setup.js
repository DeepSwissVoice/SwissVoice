import(/* webpackChunkName: "bootstrap" */ "bootstrap");

import SwissVoiceAPI from "./api";
import {promptCanton} from "./select-canton";

export default function setup(options) {
    options = Object.assign({setupAPI: true}, options);

    const elements = {};

    async function setupPage() {
        if (options.elements) {
            for (const [id, selector] of Object.entries(options.elements)) {
                elements[id] = $(selector);
            }
        }
        if (options.buttons) {
            for (const [selector, listener] of Object.entries(options.buttons)) {
                $(selector).click(listener);
            }
        }
    }

    async function ready() {
        if (options.elements || options.buttons) {
            await setupPage();
        }
        if (options.setupAPI) {
            await SwissVoiceAPI.ready;

            if (!SwissVoiceAPI.canton()) {
                await SwissVoiceAPI.canton(await promptCanton(false));
            }
        }

        if (options.onReady) {
            options.onReady();
        }
    }

    function preLoad() {
        if (options.setupAPI) {
            SwissVoiceAPI.setup();
        }
        if (options.onBeforeLoad) {
            options.onBeforeLoad();
        }

        $(ready);
    }

    async function setupRaven() {
        const Raven = await import(/* webpackChunkName: "raven" */ "raven-js");
        Raven.config("https://a77ca179811843448e922378bad5d3b2@sentry.io/1223488", {
            release: VERSION
        }).install();
        Raven.context(preLoad);
    }

    setupRaven();

    return {elements};
}