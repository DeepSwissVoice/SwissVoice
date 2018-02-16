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
  if(currentState == 1){
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
  var listOfCantons = listOfRegions[0].cantons;
  for(var a = 0; a < listOfCantons.length; a++) {
    var cantonName = listOfCantons[a].name;
    var cantonImageSrc = listOfCantons[a].image;
    var cantonImage = document.createElement("img");
    cantonImage.src = cantonImageSrc;
    cantonImage.setAttribute("width", "25%");
    cantonImage.style = "padding: 5px;";
    var cantonNameHandleEventObject = {
      handleEvent: function() {
          saveCanton(this.localCantonName, this.localCantonImageSrc);
      },
      localCantonName: cantonName,
      localCantonImageSrc: cantonImageSrc
    };
    cantonImage.addEventListener("click", cantonNameHandleEventObject , false);
    document.getElementById("imageView").appendChild(cantonImage);
  }
}

function saveCanton(selectedCantonName, selectedCantonImageSrc){
  localStorage.cantonName = selectedCantonName;
  console.log(localStorage.cantonName); //TODO: Delete after testing
  displayCantonFlag(selectedCantonImageSrc);
  showOverlay(0);
}

function displayCantonFlag(selectedCantonImageSrc){
  document.getElementById("currentCantonImage").src = selectedCantonImageSrc;
  document.getElementById("currentCantonImage").hidden = "";
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
