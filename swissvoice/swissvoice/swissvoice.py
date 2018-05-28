"""Main stuff for the app."""

import os
from datetime import datetime
from os import path

from bson.objectid import InvalidId, ObjectId
from flask import Flask, Response, g, request
from raven.contrib.flask import Sentry
from werkzeug.utils import secure_filename

from . import proxy
from .utils import Error, cast_type, error_response, response

app = Flask(__name__)
app.config.from_object(f"{__package__}.default_config")
app.config.from_envvar(app.config["ENVVARKEY"])

Sentry(app, dsn=app.config["SENTRY_DSN"])


@app.teardown_appcontext
def close_mongo(*args):
    if "mongo_client" in g:
        g.mongo_client.close()


@app.route("/api/regions")
def get_regions() -> Response:
    pipeline = [
        {"$lookup": {"from": "cantons", "localField": "cantons", "foreignField": "_id", "as": "cantons"}}
    ]
    raw_regions = proxy.regions_coll.aggregate(pipeline)
    regions = [{"_id": str(region["_id"]), "cantons": [{"name": canton["_id"], "image": canton["image"]} for canton in region["cantons"]]} for region
               in raw_regions]
    return response(regions=regions)


@app.route("/api/text/<region>")
def get_text(region: str) -> Response:
    count = cast_type(int, request.args.get("count"), 3)
    if not 0 < count <= app.config["MAX_REQUEST_COUNT"]:
        return error_response(Error.INVALID_REQUEST, f"Invalid amount of samples requested! ({count})")

    res = proxy.texts_coll.find({"region": region}, sort=[("voice_samples", 1)], limit=count)
    texts = [dict(text=doc["text"], text_id=str(doc["_id"])) for doc in res]
    if not texts:
        return error_response(Error.NO_TEXT_FOUND, "Couldn't find any texts")
    return response(texts=texts)


@app.route("/api/voice/<region>")
def get_voice_sample(region: str) -> Response:
    count = cast_type(int, request.args.get("count"), 3)
    if not 0 < count <= app.config["MAX_REQUEST_COUNT"]:
        return error_response(Error.INVALID_REQUEST, f"Invalid amount of samples requested! ({count})")

    voice_cur = proxy.audio_samples_coll.find({"region": region}, sort=[("votes", 1)], limit=count)
    samples = []
    for sample in voice_cur:
        text_doc = proxy.texts_coll.find_one(sample["text_id"])
        samples.append(dict(text=text_doc["text"], location=sample["filename"], voice_id=str(sample["_id"])))
    if not samples:
        return error_response(Error.NO_SAMPLE_FOUND, "Couldn't find any voice samples")
    return response(samples=samples)


@app.route("/api/vote/<sample_id>")
def vote_voice_sample(sample_id: str) -> Response:
    def conv(val):
        val = val.lower()
        return (
            True if val in {"u", "up", "y", "yes", "true", "t"} else
            False if val in {"d", "down", "n", "no", "false", "f"} else
            None
        )

    raw_vote = request.args.get("vote")
    vote = cast_type(conv, raw_vote, None)
    if vote is None:
        return error_response(Error.INVALID_REQUEST, f"Can't tell what you're trying to vote. ({raw_vote})")
    try:
        sample_id = ObjectId(sample_id)
    except InvalidId:
        return error_response(Error.INVALID_REQUEST, f"The provided sample_id is not a valid id. ({sample_id})")
    voice_coll = proxy.audio_samples_coll.find_one(sample_id)
    if not voice_coll:
        return error_response(Error.NO_SAMPLE_FOUND, f"No sample found with this id. ({sample_id})")
    proxy.audio_samples_coll.update_one({"_id": sample_id}, {
        "$currentDate": {
            "edited_at": True
        },
        "$inc": {
            "votes": 1,
            "balance": int(vote)
        }
    })
    return response()


@app.route("/api/upload/<text_id>", methods=["PUT", "POST"])
def upload_voice_sample(text_id: str) -> Response:
    try:
        text_oid = ObjectId(text_id)
    except InvalidId:
        return error_response(Error.INVALID_REQUEST, f"The provided text id is not a valid id ({text_id})")
    res = proxy.texts_coll.find_one(text_oid)
    if not res:
        return error_response(Error.NO_TEXT_FOUND, f"There's no text with that id ({text_id})")

    if "file" not in request.files:
        return error_response(Error.INVALID_REQUEST, "No file attached!")
    upload_file = request.files["file"]
    file_oid = ObjectId()
    filename = secure_filename(f"{str(file_oid)}.mp3")
    filedir = app.config["VOICE_SAMPLES_FOLDER"]
    filepath = path.join(filedir, filename)

    if not path.exists(filedir):
        os.makedirs(filedir)

    upload_file.save(filepath)

    proxy.audio_samples_coll.insert_one({
        "_id": file_oid,
        "filename": filename,
        "text_id": text_oid,
        "region": res["region"],
        "votes": 0,
        "balance": 0,
        "created_at": datetime.utcnow(),
        "edited_at": datetime.utcnow()
    })

    proxy.texts_coll.update_one({"_id": text_oid}, {
        "$inc": {
            "voice_samples": 1
        }
    })
    return response()
