let player;
let currentSample;

async function init() {
  await SwissVoiceAPI.setup("test");
  nextSample();
}

function nextSample() {
  currentSample = SwissVoiceAPI.getSample();
  $("#text_sample_display").text(currentSample.text);
  $("#sample_voting").removeClass("active");
}

function getSample() {
  if (!currentSample) {
    nextSample();
  }
  return currentSample;
}

function onAudioEnd() {
  $("#sample_voting").addClass("active");
  player = null;
}

function togglePlay() {
  if (player) {
    player.pause();
    player = null;
    return;
  }
  sample = getSample();
  player = new Audio(sample.location);
  player.addEventListener("ended", onAudioEnd);
  player.play();
}

function voteSample(opinion) {
  if (currentSample && $("#sample_voting").hasClass("active")) {
    SwissVoiceAPI.approveSample(opinion);
    nextSample();
  }
}

$(document).ready(init);
