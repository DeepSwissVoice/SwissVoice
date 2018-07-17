export default (() => {
    const settings = {
        domain: "/",
        minCacheSize: 5,
        cacheRestockCount: 10
    };

    let currentCanton;

    let readyPromise;
    let regionId;

    const currentItems = {
        text: null,
        proposed: null,
        voice: null
    };
    const cache = {
        text: [],
        proposed: [],
        voice: []
    };

    const regions = [];
    const cantons = [];

    function buildUrl(...endpoint) {
        return settings.domain + endpoint.join("/");
    }

    async function ensureCache(name, lazy = true) {
        async function restockCache() {
            const url = buildUrl("api", name, regionId);
            const resp = await $.getJSON(url, {
                count: settings.cacheRestockCount
            });

            if (!resp.success) {
                Raven.captureBreadcrumb({data: resp});
                throw new Error("Unsuccessful request to retrieve items for \"" + name + "\" cache");
            }

            cache[name].push(...resp.items);
        }

        const itemsLeft = cache[name].length;
        if (itemsLeft < settings.minCacheSize) {
            const promise = restockCache();
            if (itemsLeft < 1 || !lazy) {
                await promise;
            }
        }
    }

    async function getItemFromCache(name) {
        await ensureCache(name);
        const item = cache[name].shift();
        currentItems[name] = item;
        return item;
    }

    function invalidateCaches() {
        Object.values(cache).map((value) => value.length = 0);
    }

    function extractCantons() {
        for (const region of regions) {
            for (const canton of region.cantons) {
                canton.region = region._id;
                cantons.push(canton);
            }
        }
    }

    async function loadRegions() {
        const url = buildUrl("api", "regions");
        const resp = await $.getJSON(url);
        if (!resp.success) {
            Raven.captureBreadcrumb({data: resp});
            throw new Error("Couldn't fetch any regions!");
        }
        regions.push(...resp.regions);

        extractCantons();
    }

    async function getCantons() {
        if (cantons.length > 0) {
            return cantons;
        }
        await loadRegions();
        return cantons;
    }

    async function verifyCanton(canton) {
        if (canton && canton.region && canton.name && canton.image) {
            const url = buildUrl("api", "regions", "verify", canton.region);
            let resp;

            try {
                resp = await $.getJSON(url);
            } catch (e) {
                return false;
            }

            if (resp.success && resp.cantons.indexOf(canton.name) >= 0) {
                return true;
            }
        }

        return false;
    }

    async function setup(canton) {
        if (!canton) {
            canton = JSON.parse(localStorage.getItem("canton"));
            const valid = await verifyCanton(canton);
            if (!valid) {
                canton = null;
            }
        }
        if (canton) {
            currentCanton = canton;
            regionId = canton.region;

            invalidateCaches();
        }
    }

    return {
        canton(newCanton) {
            if (newCanton) {
                currentCanton = newCanton;
                regionId = newCanton.region;

                localStorage.setItem("canton", JSON.stringify(newCanton));
                invalidateCaches();
            }
            return currentCanton;
        },
        setup(canton) {
            readyPromise = setup(canton);
            return readyPromise;
        },
        get ready() {
            if (!readyPromise) {
                this.setup();
            }
            return readyPromise;
        },
        async getCantons() {
            return await getCantons();
        },
        async getText() {
            return await getItemFromCache("text");
        },
        async getProposedText() {
            return await getItemFromCache("proposed");
        },
        async getSample() {
            return await getItemFromCache("voice");
        },
        async proposeTexts(...texts) {
            const payload = {texts};
            const url = buildUrl("api", "text", regionId);
            return await $.ajax(url, {
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(payload)
            });
        },
        async approveSample(opinion, voiceId) {
            opinion = Boolean(opinion);
            voiceId = voiceId || currentItems.voice.voice_id;
            const url = buildUrl("api", "voice", "vote", voiceId);
            const resp = await $.getJSON(url, {
                "vote": opinion
            });
            return resp.success;
        },
        async voteProposed(opinion, id) {
            opinion = Boolean(opinion);
            id = id || (currentItems.proposed ? currentItems.proposed.id : null);
            if (!id) {
                return false;
            }
            const url = buildUrl("api", "proposed", "vote", id);
            const resp = await $.getJSON(url, {
                "vote": opinion
            });
            return resp.success;
        },
        async uploadSample(blob, textId) {
            textId = textId || currentItems.text.text_id;
            const url = buildUrl("api", "upload", textId);
            return await $.ajax(url, {
                method: "POST",
                contentType: blob.type,
                data: blob,
                processData: false
            });
        },
        async getStatistics() {
            const url = buildUrl("api", "stats");
            const result = await $.getJSON(url);
            return result.data;
        }
    };
})();