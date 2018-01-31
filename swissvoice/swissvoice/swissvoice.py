"""Main stuff for the app."""

import wave
from datetime import datetime
from functools import partial
from os import path

from bson.objectid import InvalidId, ObjectId
from flask import Flask, g, request
from pymongo import MongoClient
from werkzeug.local import LocalProxy
from werkzeug.utils import secure_filename

from .utils import Error, cast_type, error_response, response

app = Flask(__name__)
app.config.from_object(f"{__package__}.default_config")
app.config.from_envvar(app.config["ENVVARKEY"])


def get_mongo():
    """Get or create the Mongo client."""
    if "mongo_client" not in g:
        g.mongo_client = MongoClient(app.config["MONGODB_URI"])
    return g.mongo_client


def get_mongo_database():
    """Get the database."""
    return get_mongo()[__package__]


def get_mongo_collection(name):
    """Get a collection."""
    return get_mongo_database()[name]


mongo_client = LocalProxy(get_mongo)
mongo_database = LocalProxy(get_mongo_database)
texts_coll = LocalProxy(partial(get_mongo_collection, "texts"))
audio_samples_coll = LocalProxy(partial(get_mongo_collection, "audio_samples"))


@app.teardown_appcontext
def close_mongo(exception):
    """Clean closing for MongoDB."""
    if "mongo_client" in g:
        g.mongo_client.close()


@app.route("/api/text/<region>")
def get_text(region):
    """Get a text."""
    count = cast_type(int, request.args.get("count"), 3)
    if not 0 < count <= app.config["MAX_REQUEST_COUNT"]:
        return error_response(Error.INVALID_REQUEST, f"Invalid amount of samples requested! ({count})")
    res = texts_coll.find({"region": region}, sort=[("voice_samples", 1)], limit=count)
    texts = [dict(text=doc["text"], text_id=str(doc["_id"])) for doc in res]
    if not texts:
        return error_response(Error.NO_TEXT_FOUND, "Couldn't find any texts")
    return response(texts=texts)


@app.route("/api/voice/<region>")
def get_voice_sample(region):
    """Get a voice sample."""
    count = cast_type(int, request.args.get("count"), 3)
    if not 0 < count <= app.config["MAX_REQUEST_COUNT"]:
        return error_response(Error.INVALID_REQUEST, f"Invalid amount of samples requested! ({count})")
    voice_cur = audio_samples_coll.find({"region": region}, sort=[("votes", 1)], limit=count)
    samples = []
    for sample in voice_cur:
        text_doc = texts_coll.find_one(sample["text_id"])
        samples.append(dict(location=text_doc["text"], voice_id=str(sample["_id"])))
    if not samples:
        return error_response(Error.NO_SAMPLE_FOUND, "Couldn't find any voice samples")
    return response(samples=samples)


@app.route("/api/vote/<sample_id>")
def vote_voice_sample(sample_id):
    """Vote."""
    def conv(val):
        val = val.lower()
        return (
            True if val in {"u", "up", "y", "yes"} else
            False if val in {"d", "down", "n", "no"} else
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
    voice_coll = audio_samples_coll.find_one(sample_id)
    if not voice_coll:
        return error_response(Error.NO_SAMPLE_FOUND, f"No sample found with this id. ({sample_id})")
    audio_samples_coll.update_one(sample_id, {
        "$currentTime": {
            "edited_at": True
        },
        "$inc": {
            "votes": 1,
            "balance": 2 * int(vote) - 1
        }
    })
    return response()


@app.route("/api/upload/<text_id>")
def upload_voice_sample(text_id):
    """Upload voice sample to server."""
    try:
        text_oid = ObjectId(text_id)
    except InvalidId:
        return error_response(Error.INVALID_REQUEST, f"The provided text id is not a valid id ({text_id})")
    res = texts_coll.find_one(text_oid)
    if not res:
        return error_response(Error.NO_TEXT_FOUND, f"There's no text with that id ({text_id})")

    if "file" not in request.files:
        return error_response(Error.INVALID_REQUEST, "No file attached!")
    upload_file = request.files["file"]
    with wave.open(upload_file, "rb") as wav:
        frames = wav.getnframes()
        rate = wav.getframerate()
        duration = frames / rate
        # TODO do more file checks and wrap in a try statement

    file_oid = ObjectId()
    filename = secure_filename(f"{str(file_oid)}.wav")
    filepath = path.join(app.config["VOICE_SAMPLES_FOLDER"], filename)
    upload_file.save(filepath)

    audio_samples_coll.insert_one({
        "_id": file_oid,
        "filename": filename,
        "text_id": text_oid,
        "votes": 0,
        "balance": 0,
        "created_at": datetime.utcnow(),
        "edited_at": datetime.utcnow()
    })

    texts_coll.update_one(text_oid, {
        "$inc": {
            "voice_samples": 1
        }
    })
    return response()
