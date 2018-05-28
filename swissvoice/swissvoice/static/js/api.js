const SwissVoiceAPI = (() => {
    const settings = {
        domain: "/",
        minCacheSize: 5,
        cacheRestockCount: 10
    };

    let regionId = "";
    let currentText = null;
    let currentSample = null;

    const textCache = [];
    const sampleCache = [];
    const regions = [];

    function buildUrl(...endpoint) {
        return settings.domain + endpoint.join("/");
    }

    async function ensureTextCache() {
        if (textCache.length < settings.minCacheSize) {
            const url = buildUrl("api", "text", regionId);
            const resp = await $.getJSON(url, [
                ["count", settings.cacheRestockCount]
            ]);
            if (!resp.success) {
                throw new Error("Couldn't get any texts", resp.error);
            }
            textCache.push(...resp.texts);
        }
    }

    async function ensureSampleCache() {
        if (sampleCache.length < settings.minCacheSize) {
            const url = buildUrl("api", "voice", regionId);
            const resp = await $.getJSON(url, [
                ["count", settings.cacheRestockCount]
            ]);
            if (!resp.success) {
                throw new Error("Couldn't get any samples", resp.error);
            }
            sampleCache.push(...resp.samples);
        }
    }

    async function fetchRegions() {
        if (regions.length > 0) {
            return false;
        }
        const url = buildUrl("api", "regions");
        const resp = await $.getJSON(url);
        if (!resp.success) {
            throw new Error("Couldn't fetch any regions!", resp.error);
        }
        regions.push(...resp.regions);
    }

    return {
        setRegion(region) {
            regionId = region;
        },
        async setup(region, apiDomain = "/") {
            regionId = region;
            settings.domain = apiDomain;

            await ensureTextCache();
            await ensureSampleCache();
            await fetchRegions();
        },
        getRegions() {
            return regions;
        },
        getText() {
            ensureTextCache();
            const item = textCache.shift();
            currentText = item;
            return item;
        },
        getSample() {
            ensureSampleCache();
            const item = sampleCache.shift();
            item.location = buildUrl("samples", item.location).slice(1);
            currentSample = item;
            return item;
        },
        async approveSample(opinion, voiceId) {
            opinion = Boolean(opinion);
            voiceId = voiceId || currentSample.voice_id;
            const url = buildUrl("api", "vote", voiceId);
            const resp = await $.getJSON(url, [
                ["vote", opinion]
            ]);
            return resp.success;
        },
        async uploadSample(blob, textId) {
            textId = textId || currentText.text_id;
            const url = buildUrl("api", "upload", textId);
            return await $.post(url, blob);
        }
    };
})();
