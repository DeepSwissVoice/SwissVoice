const HTTP = (() => {
  function ajax(method, url, params, body, headers) {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();

      if (params) {
        let paramString = "?";
        for (let i = 0; i < params.length; i++) {
          paramString += String(params[i][0]) + "=" + String(params[i][1]) + "&";
        }
        paramString = paramString.slice(0, -1);
        url += paramString;
      }

      request.addEventListener("load", () => resolve(request.response));
      request.addEventListener("error", () => reject(request.response));
      request.open(method, url);

      if (headers) {
        for (let i = 0; i < headers.length; i++) {
          request.setRequestHeader(headers[i][0], headers[i][1]);
        }
      }

      request.send(body);
    });
  }

  return {
    async get(url, params, headers, json = true) {
      const resp = await ajax("GET", url, params = params, headers = headers);
      if (json) {
        return JSON.parse(resp);
      }
      return resp;
    },
    async post(url, body, params, headers, json = true) {
      const resp = await ajax("POST", url, params = params, headers = headers, body = body);
      if (json) {
        return JSON.parse(resp);
      }
      return resp;
    }
  };
})();

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

  function buildUrl(...endpoint) {
    return settings.domain + endpoint.join("/");
  }

  async function ensureTextCache() {
    if (textCache.length < settings.minCacheSize) {
      const url = buildUrl("api", "text", regionId);
      const resp = await HTTP.get(url, [
        ["count", settings.cacheRestockCount]
      ]);
      if (!resp.success) {
        throw Exception();
      }
      textCache.push(...resp.texts);
    }
  };

  async function ensureSampleCache() {
    if (sampleCache.length < settings.minCacheSize) {
      const url = buildUrl("api", "voice", regionId);
      const resp = await HTTP.get(url, [
        ["count", settings.cacheRestockCount]
      ]);
      if (!resp.success) {
        throw Exception();
      }
      sampleCache.push(...resp.samples);
    }
  };

  return {
    async setup(region, apiDomain = "/") {
      regionId = region;
      settings.domain = apiDomain;

      ensureTextCache();
      ensureSampleCache();
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
      currentSample = item;
      return item;
    },
    async approveSample(opinion, voiceId) {
      opinion = Boolean(opinion);
      voiceId = voiceId || currentSample.voice_id;
      const url = buildUrl("api", "vote", voiceId);
      const resp = await HTTP.get(url, [
        ["vote", opinion]
      ]);
      return resp.success;
    }
  };
})();