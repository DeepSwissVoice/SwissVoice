import logging

from bson import ObjectId
from bson.errors import InvalidId
from flask import Flask
from werkzeug.routing import BaseConverter, ValidationError

log = logging.getLogger(__name__)


class ObjectIdConverter(BaseConverter):
    def to_python(self, value: str) -> ObjectId:
        try:
            return ObjectId(value)
        except InvalidId:
            raise ValidationError()

    def to_url(self, oid: ObjectId) -> str:
        return str(ObjectId)


def register_converters(app: Flask):
    app.url_map.converters["oid"] = ObjectIdConverter
    log.info("Registered converters")
