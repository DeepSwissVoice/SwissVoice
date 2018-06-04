import datetime
import logging.config
from datetime import datetime
from io import BytesIO

from bson.objectid import InvalidId, ObjectId
from flask import Response, request
from pymongo.errors import BulkWriteError

from . import proxy, transcoder
from .factory import get_app
from .utils import Error, cast_type, error_response, response

log = logging.getLogger(__name__)

app = get_app()
app.teardown_appcontext(proxy.teardown)


@app.route("/api/regions")
def get_regions() -> Response:
    pipeline = [
        {"$lookup": {"from": "cantons", "localField": "cantons", "foreignField": "_id", "as": "cantons"}}
    ]
    raw_regions = proxy.regions_coll.aggregate(pipeline)
    regions = [{"_id": str(region["_id"]), "cantons": [{"name": canton["_id"], "image": canton["image"]} for canton in region["cantons"]]} for region
               in raw_regions]
    return response(regions=regions)


@app.route("/api/text/<region>", methods=["GET"])
def get_text(region: str) -> Response:
    count = cast_type(int, request.args.get("count"), 3)
    if not 0 < count <= app.config["MAX_REQUEST_COUNT"]:
        return error_response(Error.INVALID_REQUEST, f"Invalid amount of samples requested! ({count})")

    res = proxy.texts_coll.find({"region": region}, sort=[("voice_samples", 1)], limit=count)
    texts = [dict(text=doc["text"], text_id=str(doc["_id"])) for doc in res]
    if not texts:
        return error_response(Error.NO_TEXT_FOUND, "Couldn't find any texts")
    return response(texts=texts)


@app.route("/api/text/<region>", methods=["PUT", "POST"])
def propose_text(region: str):
    data = request.json
    if not data:
        return error_response(Error.INVALID_REQUEST, "No JSON body data")
    texts = data.get("texts")
    if not texts:
        return error_response(Error.INVALID_REQUEST, "Empty list of texts")

    if len(texts) > app.config["MAX_PROPOSE_COUNT"]:
        return error_response(Error.INVALID_REQUEST, "Too many texts proposed! The max is " + str(app.config["MAX_PROPOSE_COUNT"]))

    documents = (dict(region=region, text=text) for text in texts)

    try:
        result = proxy.proposed_texts_coll.insert_many(documents, ordered=False)
    except BulkWriteError as error:
        write_errors = error.details["writeErrors"]
        failed_indices = [err["index"] for err in write_errors]
        num_succeeded = error.details["nInserted"]
    else:
        failed_indices = []
        num_succeeded = len(result.inserted_ids)

    log.debug(f"proposed {num_succeeded} texts, {len(failed_indices)} failed")
    return response(succeeded=num_succeeded, failed=failed_indices)


@app.route("/api/voice/<region>")
def get_voice_sample(region: str) -> Response:
    count = cast_type(int, request.args.get("count"), 3)
    if not 0 < count <= app.config["MAX_REQUEST_COUNT"]:
        return error_response(Error.INVALID_REQUEST, f"Invalid amount of samples requested! ({count})")

    voice_cur = proxy.audio_samples_coll.find({"region": region}, sort=[("votes", 1)], limit=count)
    samples = []
    for sample in voice_cur:
        text_doc = proxy.texts_coll.find_one(sample["text_id"])
        location = app.config["RECORDING_LOCATION"] + "/" + sample["key"]

        samples.append(dict(text=text_doc["text"], location=location, voice_id=str(sample["_id"])))
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

    log.debug("transcoding upload")
    transcoded_file = transcoder.transcode(request.data, "mp3", "mp3")
    upload_file = BytesIO(transcoded_file)

    if not upload_file:
        return error_response(Error.INVALID_REQUEST, "No data attached!")

    recording_id = ObjectId()
    key = app.config["RECORDING_KEY_PREFIX"] + str(recording_id) + ".mp3"

    log.debug(f"uploading recording \"{key}\"")
    proxy.s3_client.upload_fileobj(upload_file, Bucket=app.config["BUCKET_NAME"], Key=key,
                                   ExtraArgs={"ACL": "public-read", "ContentType": "audio/mpeg"})

    proxy.audio_samples_coll.insert_one({
        "_id": recording_id,
        "key": key,
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


@app.route("/api/stats")
def get_statistics() -> Response:
    iso_year, iso_week, _ = datetime.today().isocalendar()
    result = proxy.statistics_coll.find_one({"iso_year": iso_year, "iso_week": iso_week})
    if result:
        stats = result["stats"]
    else:
        log.info(f"Counting statistics for week {iso_year}-{iso_week}")

        total_votes_aggr = proxy.audio_samples_coll.aggregate([{"$group": {"_id": None, "sum": {"$sum": "$votes"}}}])
        regions_aggr = proxy.regions_coll.aggregate([
            {"$lookup": {"from": "texts", "localField": "_id", "foreignField": "region", "as": "texts"}},
            {"$lookup": {"from": "audio_samples", "localField": "_id", "foreignField": "region", "as": "audio_samples"}},
            {"$project": {"_id": "$_id", "total_texts": {"$size": "$texts"}, "total_samples": {"$size": "$audio_samples"}}}
        ])

        stats = {
            "total_texts": proxy.texts_coll.count(),
            "total_samples": proxy.audio_samples_coll.count(),
            "total_votes": total_votes_aggr.next()["sum"],
            "regions": list(regions_aggr)
        }
        
        proxy.statistics_coll.insert_one({
            "stats": stats,
            "iso_year": iso_year,
            "iso_week": iso_week
        })
        log.info("Statistics done!")

    return response(data=stats)
