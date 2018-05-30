__all__ = ["mongo_client", "mongo_database", "texts_coll", "audio_samples_coll", "regions_coll"]

from functools import partial

from flask import current_app, g
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database
from werkzeug.local import LocalProxy


def get_mongo() -> MongoClient:
    if "mongo_client" not in g:
        g.mongo_client = MongoClient(current_app.config["MONGODB_URI"])
    return g.mongo_client


def get_mongo_database() -> Database:
    return mongo_client[current_app.config["DATABASE_NAME"]]


def get_mongo_collection(name) -> Collection:
    return mongo_database[name]


mongo_client: MongoClient = LocalProxy(get_mongo)
mongo_database: Database = LocalProxy(get_mongo_database)
texts_coll: Collection = LocalProxy(partial(get_mongo_collection, "texts"))
audio_samples_coll: Collection = LocalProxy(partial(get_mongo_collection, "audio_samples"))
regions_coll: Collection = LocalProxy(partial(get_mongo_collection, "regions"))
