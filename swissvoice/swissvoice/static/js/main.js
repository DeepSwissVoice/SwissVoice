let player;
let currentSample;

async function init() {
  await SwissVoiceAPI.setup("test");
  nextSample();
  await SwissVoiceAPI.getRegions();
  fecthCantons();
}

function nextSample() {
  currentSample = SwissVoiceAPI.getSample();
  $("#text_sample_display").text(currentSample.text);
  $("#sample_voting").removeClass("active");
}

function showOverlay(currentState){
  if(currentState == 0){
    window.scrollTo(0,0);
    document.getElementsByTagName("body")[0].style = "overflow: hidden";
    $(".cover").fadeIn("slow");
    $(".popup").fadeIn("slow");
  } else {
    document.getElementsByTagName("body")[0].style = "";
    $(".cover").fadeOut("slow");
    $(".popup").fadeOut("slow");
  }
}

function fecthCantons(){
  var listOfRegions = SwissVoiceAPI.getRegions();
  var listOfCantons;
  listOfCantons = listOfRegions[0].cantons;
  for(var a = 0; a < listOfCantons.length; a++) {
    var regionName = listOfCantons[a].name;
    var regionElement = document.createElement("P");
    var regionImage = document.createElement("img");
    regionImage.src = 'images/' + regionName + '.svg';
    regionImage.setAttribute("width", "30%");
    regionImage.setAttribute("height", "30%");
    regionImage.addEventListener("click", function(){console.log(regionName)});
    regionElement.appendChild(regionImage);
    document.getElementById("popup").appendChild(regionElement);
  }
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
