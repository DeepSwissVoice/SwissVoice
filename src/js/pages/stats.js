import SwissVoiceAPI from "../api";
import setup from "../page-setup";
import {animateCountUp} from "../visuals";

const {elements} = setup({
    onReady: init,
    requireCanton: false,
    elements: {
        contentMain: "#content",
        totalVotesDisplay: "#total-votes-display",
        totalTextsDisplay: "#total-texts-display",
        totalProposedDisplay: "#total-proposed-display",
        totalSamplesDisplay: "#total-samples-display",
        totalSamplesDurationDisplay: "#total-samples-duration-display",
        regionTextsDistributionDoughnut: "#region-texts-distribution-doughnut",
        regionProposedTextsDistributionDoughnut: "#region-proposed-texts-distribution-doughnut",
        regionSamplesDistributionDoughnut: "#region-samples-distribution-doughnut",
        interactionTimeline: "#interaction-timeline"
    }
});

const avgDurAudioSample = 3;


async function buildColourMap(spec, nShades) {
    const colormap = (await import(/* webpackChunkName: "colormap" */ "colormap")).default;
    const colorScale = (await import(/* webpackChunkName: "colormap" */ "colormap/colorScale")).default;

    const minShades = colorScale[spec].length;
    const shades = Math.max(minShades + 1, nShades);
    const _colours = colormap({colormap: spec, nshades: shades});
    return _colours.slice(0, nShades);
}

function formatTime(seconds) {
    const min = Math.round(seconds / 60);
    const hours = Math.round(min / 60);
    if (hours > 5) {
        return hours + " Stunden";
    } else {
        return min + " Minuten";
    }
}

function regionDoughnut(allRegions, colours, attribute, element, label) {
    const regions = allRegions.filter((region) => region[attribute] > 0);

    return new Chart(element, {
        type: "doughnut",
        data: {
            labels: regions.map((el) => el.name || el._id),
            datasets: [{
                label: label,
                data: regions.map((el) => el[attribute]),
                backgroundColor: colours,
                borderColor: colours,
                borderWidth: 0
            }]
        }
    });
}


async function displayStatistics(data) {
    const Chart = (await import(/* webpackChunkName: "chart.js" */ "chart.js")).Chart;
    const moment = (await import(/* webpackChunkName: "moment" */ "moment")).default;

    moment.locale("de");

    let colours, chart;

    Chart.defaults.global.animation.duration = 2500;
    animateCountUp(elements.totalVotesDisplay, data.total_votes);
    animateCountUp(elements.totalTextsDisplay, data.total_texts);
    animateCountUp(elements.totalProposedDisplay, data.total_proposed);
    animateCountUp(elements.totalSamplesDisplay, data.total_samples);
    animateCountUp(elements.totalSamplesDurationDisplay, data.total_samples * avgDurAudioSample, {callback: formatTime});

    // Distribution doughnuts
    colours = await buildColourMap("earth", data.regions.length);

    regionDoughnut(data.regions, colours, "total_texts", elements.regionTextsDistributionDoughnut, "Anzahl Sätze");
    regionDoughnut(data.regions, colours, "total_proposed", elements.regionProposedTextsDistributionDoughnut, "Anzahl vorgeschlagener Sätze");
    regionDoughnut(data.regions, colours, "total_samples", elements.regionSamplesDistributionDoughnut, "Anzahl Aufnahmen");

    // Timeline

    const history = data.history.reverse();
    colours = [
        "#58A8D9",
        "#58A810",
        "#1D628C",
        "#D9A358"
    ];

    chart = new Chart(elements.interactionTimeline, {
        type: "line",
        data: {
            datasets: [["Sätze", "total_texts"], ["Vorgeschlagene Sätze", "total_proposed"], ["Aufnahmen", "total_samples"], ["Stimmen", "total_votes"]].map(
                ([label, dataLabel], idx) => ({
                    label,
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
    await displayStatistics(stats);
}