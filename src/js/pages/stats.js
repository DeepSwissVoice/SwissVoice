import "bootstrap";
import colormap from "colormap";
import colorScale from "colormap/colorScale";
import moment from "moment";
import Chart from "../../../node_modules/chart.js/src/chart";

import SwissVoiceAPI from "../api";
import setup from "../page-setup";
import {animateCountUp} from "../visuals";

const avgDurAudioSample = 3;


function buildColourMap(spec, nshades) {
    const minShades = colorScale[spec].length;
    const shades = Math.max(minShades + 1, nshades);
    const _colours = colormap({colormap: spec, nshades: shades});
    return _colours.slice(0, nshades);
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
    let colours;

    Chart.defaults.global.animation.duration = 2500;
    animateCountUp(elements.totalVotesDisplay, data.total_votes);
    animateCountUp(elements.totalTextsDisplay, data.total_texts);
    animateCountUp(elements.totalSamplesDisplay, data.total_samples);
    animateCountUp(elements.totalSamplesDurationDisplay, data.total_samples * avgDurAudioSample, {callback: formatTime});

    // Distribution doughnuts
    colours = buildColourMap("earth", data.regions.length);

    Chart(elements.regionTextsDistributionDoughnut, {
        type: "doughnut",
        data: {
            labels: data.regions.map((el) => el._id),
            datasets: [{
                label: "# of texts",
                data: data.regions.map((el) => el.total_texts),
                backgroundColor: colours,
                borderColor: colours,
                borderWidth: 0
            }]
        }
    });

    Chart(elements.regionSamplesDistributionDoughnut, {
        type: "doughnut",
        data: {
            labels: data.regions.map((el) => el._id),
            datasets: [{
                label: "# of voice samples",
                data: data.regions.map((el) => el.total_samples),
                backgroundColor: colours,
                borderColor: colours,
                borderWidth: 0
            }]
        }
    });

    // Timeline

    const history = data.history.reverse();
    colours = ["#58A8D9", "#1D628C", "#D9A358"];

    Chart(elements.interactionTimeline, {
        type: "line",
        data: {
            datasets: [["Texts", "total_texts"], ["Samples", "total_samples"], ["Votes", "total_votes"]].map(
                ([label, dataLabel], idx) => ({
                    label: label,
                    data: history.map((el) => ({t: moment().year(el.iso_year).isoWeek(el.iso_week), y: el[dataLabel]})),
                    cubicInterpolationMode: "monotone",
                    backgroundColor: colours[idx],
                    borderColor: colours[idx],
                    borderWidth: 5,
                    fill: false,
                    pointHitRadius: 10
                })
            )
        },
        options: {
            scales: {
                xAxes: [{
                    type: "time",
                    gridLines: {
                        display: false
                    }
                }],
                yAxes: [{
                    stacked: true
                }]
            }
        }
    });

    elements.contentMain.removeClass("loading");
}

async function init() {
    const stats = await SwissVoiceAPI.getStatistics();
    displayStatistics(stats);
}

const {elements} = setup({
    onReady: init,
    elements: {
        contentMain: "#content",
        totalVotesDisplay: "#total-votes-display",
        totalTextsDisplay: "#total-texts-display",
        totalSamplesDisplay: "#total-samples-display",
        totalSamplesDurationDisplay: "#total-samples-duration-display",
        regionTextsDistributionDoughnut: "#region-texts-distribution-doughnut",
        regionSamplesDistributionDoughnut: "#region-samples-distribution-doughnut",
        interactionTimeline: "#interaction-timeline"
    }
});