import SwissVoiceAPI from "./api";

let currentPopup;

function highlightCurrentCanton() {
    const currentCanton = SwissVoiceAPI.canton();
    $(".canton-image.not-current,.canton-image.current").removeClass("not-current current");
    if (currentCanton) {
        document.getElementById("canton-" + currentCanton.name).classList.add("current");
        $(".canton-image:not(.current)").addClass("not-current");
    }
}

function showPopup(popup, display, cb) {
    if (display) {
        highlightCurrentCanton();
        popup.fadeIn("slow", cb);
    } else {
        popup.fadeOut("slow", cb);
    }
    $(document.body).toggleClass("disable-scroll");
}

export function promptCanton(cancelable) {
    return new Promise((res) => {
        buildPopup(cancelable, (canton, popup) => {
            showPopup(popup, false, () => popup.remove());
            res(canton);
        }).then((popup) => showPopup(popup, true));
    });
}

export async function toggleCantonPopup() {
    if (!currentPopup) {
        await SwissVoiceAPI.ready;
        currentPopup = await buildPopup(true);
    }

    if (currentPopup.is(":visible")) {
        showPopup(currentPopup, false);
    } else {
        showPopup(currentPopup, true);
    }
}

function selectCanton(selectedCanton) {
    if (selectedCanton) {
        SwissVoiceAPI.canton(selectedCanton);
    }
    toggleCantonPopup();
}

async function buildPopup(cancelable, cb) {
    const callback = cb || selectCanton;

    const popup = $(
        `<div id="popup" class="text-normal" style="display: none;">\
            <div class="popup-container bg-primary">\
                <p class="h4 select-canton-text my-3">Wähle deine Sprachregion aus.</p>\
                <div class="image-view"></div>\
            </div>\
            <div class="cover"></div>\
        </div>`
    );

    if (cancelable) {
        popup.find(".cover").click(() => callback());
    }

    const cantonContainer = popup.find("div.image-view");
    const cantons = await SwissVoiceAPI.getCantons();

    for (const canton of cantons) {
        $(`<img src="${canton.image}" id="canton-${canton.name}" class="canton-image">`)
            .click(() => callback(canton, popup))
            .appendTo(cantonContainer);
    }

    popup.appendTo(document.body);
    return popup;
}
