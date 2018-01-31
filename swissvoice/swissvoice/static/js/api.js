const HTTP = (() => {
  ajax(method, url, params, body, headers) {
    return Promise((resolve, reject) => {
      const request = new XMLHttpRequest();

      if (params) {
        let paramString = "?";
        for (let i = 0; i < params.length; i++) {
          paramString += String(params[i][0]) + "=" + String(params[i][1]) + "&";
        }
        paramString = paramString.slice(0, -1);
        url += paramString;
      }

      request.addEventHandler("load", () => resolve(this.response));
      request.addEventHandler("error", () => reject(this));
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
    minCacheSize: 5,
    cacheRestockCount: 10
  };
  const endpoints = {
    API: "/api",
    UPLOAD: API + "/upload",
    VOICE: API + "/voice",
    TEXT: API + "/text",
    VOTE: API + "/vote",

    SAMPLES_STORE = "/samples"
  };

  let regionId = "";
  let currentText = null;
  let currentSample = null;

  const textCache = [];
  const sampleCache = [];

  async ensureTextCache() {
    if (textCache.length < settings.minCacheSize) {
      const url = endpoints.TEXT + "/" + regionId;
      const resp = await HTTP.get(url, [
        ["count", settings.cacheRestockCount]
      ]);
      if (!resp.success) {
        throw Exception();
      }
      textCache.push(...resp.texts);
    }
  };

  async ensureSampleCache() {
    if (sampleCache.length < settings.minCacheSize) {
      const url = endpoints.VOICE + "/" + regionId;
      const resp = await HTTP.get(url, [
        ["count", settings.cacheRestockCount]
      ]);
      if (!resp.success) {
        throw Exception();
      }
      sampleCache.push(...resp.texts);
    }
  };

  return {
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
    async approveSample(opinion, sampleId) {
      opinion = opinion || false;
      sampleId = sampleId || currentSample.id;
      const url = endpoints.VOTE + "/" + sampleId;
      const resp = await HTTP.get(url, [
        ["vote", opinion]
      ]);
      return resp.success;
    }
  };
})();
