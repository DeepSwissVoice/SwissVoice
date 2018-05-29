import AudioWeb from "./audio-web";

const audioWeb = new AudioWeb();

function sleep(timeout) {
    return new Promise(res => setTimeout(res, timeout));
}

export async function record() {
    await audioWeb.init();
    const visualiser = $("#record-visualiser");
    audioWeb.setVolumeCallback(volume => requestAnimationFrame(() => visualiser.height(volume)));
    audioWeb.start();
    console.log("recording start");
    await sleep(3000);
    const result = await audioWeb.stop();
    audioWeb.release();
    console.log("recording end", result);
    window.location.href = result.url;
}