import(/* webpackChunkName: "bootstrap" */ "bootstrap");

import SwissVoiceAPI from "./api";
import {promptCanton, toggleCantonPopup} from "./select-canton";

function ajaxErrorHook() {
    $(document).ajaxError(function (event, jqXHR, ajaxSettings, thrownError) {
        Raven.captureMessage(thrownError || jqXHR.statusText, {
            extra: {
                type: ajaxSettings.type,
                url: ajaxSettings.url,
                data: ajaxSettings.data,
                status: jqXHR.status,
                error: thrownError || jqXHR.statusText,
                response: jqXHR.responseText.substring(0, 100)
            }
        });
    });
}

export default function setup(options) {
    options = Object.assign({
        setupAPI: true,
        requireCanton: true,
        toggleCantonsPopupBtn: true
    }, options);

    const elements = {};

    function setupPage() {
        if (options.toggleCantonsPopupBtn) {
            $("#toggle-cantons-popup").click(toggleCantonPopup);
        }

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
        if (options.keyUpListeners) {
            for (const [selector, listener] of Object.entries(options.keyUpListeners)) {
                $(selector).keyup(listener);
            }
        }
    }

    async function ready() {
        setupPage();

        if (options.onLoad) {
            options.onLoad();
        }

        if (options.setupAPI) {
            await SwissVoiceAPI.ready;

            if (options.requireCanton && !SwissVoiceAPI.canton()) {
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
        Raven.config("https://a77ca179811843448e922378bad5d3b2@sentry.io/1223488", {
            release: VERSION
        }).install();
        Raven.context(preLoad);
        ajaxErrorHook();
    }

    setupRaven();

    return {elements};
}
