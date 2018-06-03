import "bootstrap";
import $ from "jquery";
import colormap from "colormap";
import colorScale from "colormap/colorScale";
import Raven from "raven-js";
import Chart from "chart.js";

import SwissVoiceAPI from "./api";
import {animateCountUp} from "./visuals";
import {shuffle} from "./utils";

const elements = {};

function buildColourMap(spec, nshades, shuffleColours = true) {
    if (!spec) {
        const choices = Object.keys(colorScale);
        spec = choices[Math.floor(Math.random() * choices.length)];
    }
    const minShades = colorScale[spec].length;
    const shades = Math.max(minShades + 1, nshades);
    const _colours = colormap({colormap: spec, nshades: shades});
    const colours = _colours.slice(0, nshades);
    if (shuffleColours) {
        return shuffle(colours);
    }
    return colours;
}


function displayStatistics(data) {
    animateCountUp(elements.totalVotesDisplay, data.total_votes);
    animateCountUp(elements.totalTextsDisplay, data.total_texts);
    animateCountUp(elements.totalSamplesDisplay, data.total_samples);

    new Chart(elements.regionTextsDistributionDoughnut, {
        type: "doughnut",
        data: {
            labels: data.regions.map(el => el._id),
            datasets: [{
                label: "# of texts",
                data: data.regions.map(el => el.total_texts),
                backgroundColor: buildColourMap(null, data.regions.length)
            }]
        }
    });

    new Chart(elements.regionSamplesDistributionDoughnut, {
        type: "doughnut",
        data: {
            labels: data.regions.map(el => el._id),
            datasets: [{
                label: "# of voice samples",
                data: data.regions.map(el => el.total_samples),
                backgroundColor: buildColourMap(null, data.regions.length)
            }]
        }
    });
}

const elQueryMapping = {
    "totalVotesDisplay": "#total-votes-display",
    "totalTextsDisplay": "#total-texts-display",
    "totalSamplesDisplay": "#total-samples-display",
    "regionTextsDistributionDoughnut": "#region-texts-distribution-doughnut",
    "regionSamplesDistributionDoughnut": "#region-samples-distribution-doughnut"
};

function setupPage() {
    for (const [id, selector] of Object.entries(elQueryMapping)) {
        elements[id] = $(selector);
    }
}


async function init() {
    setupPage();
    await SwissVoiceAPI.ready;
    const stats = await SwissVoiceAPI.getStatistics();
    displayStatistics(stats);
}

function _init() {
    SwissVoiceAPI.setup();
    $(init);
}

Raven.config("https://23dcfd51df56440486089720f7184663@sentry.io/1214965", {
    release: VERSION
}).install();
Raven.context(_init);