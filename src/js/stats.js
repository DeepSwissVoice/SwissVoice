import "bootstrap";
import $ from "jquery";
import colormap from "colormap";
import colorScale from "colormap/colorScale";
import Raven from "raven-js";
import Chart from "chart.js";

import SwissVoiceAPI from "./api";
import {animateCountUp} from "./visuals";
import {shuffle} from "./utils";

const avgDurAudioSample = 3;

const elements = {};

function randomColourMap() {
    const choices = Object.keys(colorScale);
    return choices[Math.floor(Math.random() * choices.length)];
}

function buildColourMap(spec, nshades, shuffleColours = true) {
    if (!spec) {
        spec = randomColourMap();
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

function formatTime(seconds) {
    const min = Math.round(seconds / 60);
    const hours = Math.round(min / 60);
    if (hours > 5) {
        return hours + " hours";
    } else {
        return min + " minutes";
    }
}


function displayStatistics(data) {
    animateCountUp(elements.totalVotesDisplay, data.total_votes);
    animateCountUp(elements.totalTextsDisplay, data.total_texts);
    animateCountUp(elements.totalSamplesDisplay, data.total_samples);
    animateCountUp(elements.totalSamplesDurationDisplay, data.total_samples * avgDurAudioSample, {callback: formatTime});

    let spec = randomColourMap();

    new Chart(elements.regionTextsDistributionDoughnut, {
        type: "doughnut",
        data: {
            labels: data.regions.map(el => el._id),
            datasets: [{
                label: "# of texts",
                data: data.regions.map(el => el.total_texts),
                backgroundColor: buildColourMap(spec, data.regions.length, false)
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
                backgroundColor: buildColourMap(spec, data.regions.length, false)
            }]
        }
    });

    const history = data.history.reverse();
    const colours = buildColourMap(null, 3);
    new Chart(elements.interactionTimeline, {
        type: "line",
        data: {
            labels: history.map(el => el.iso_week),
            datasets: [{
                label: "# of texts",
                data: history.map(el => el.total_texts),
                borderColor: colours[0]
            }, {
                label: "# of samples",
                data: history.map(el => el.total_samples),
                borderColor: colours[1]
            }, {
                label: "# of votes",
                data: history.map(el => el.total_votes),
                borderColor: colours[2]
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    stacked: true
                }]
            }
        }
    });

    elements.contentMain.removeClass("loading");
}

const elQueryMapping = {
    contentMain: "#content",
    totalVotesDisplay: "#total-votes-display",
    totalTextsDisplay: "#total-texts-display",
    totalSamplesDisplay: "#total-samples-display",
    totalSamplesDurationDisplay: "#total-samples-duration-display",
    regionTextsDistributionDoughnut: "#region-texts-distribution-doughnut",
    regionSamplesDistributionDoughnut: "#region-samples-distribution-doughnut",
    interactionTimeline: "#interaction-timeline"
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