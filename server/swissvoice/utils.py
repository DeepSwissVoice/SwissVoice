__all__ = ["SwissJsonEncoder", "Error", "response", "error_response", "cast_type"]

from enum import IntEnum
from typing import Any, Callable, TypeVar

from bson import ObjectId
from flask import Response, jsonify
from flask.json import JSONEncoder

_DEFAULT = object()


class SwissJsonEncoder(JSONEncoder):
    def default(self, o: Any) -> Any:
        if isinstance(o, ObjectId):
            return str(o)
        return super().default(o)


class Error(IntEnum):
    GENERAL = 0
    INVALID_REQUEST = 1

    NO_TEXT_FOUND = 1001

    NO_SAMPLE_FOUND = 2001


def response(**kwargs) -> Response:
    data = kwargs
    data["success"] = kwargs.get("success", True)
    return jsonify(data)


def error_response(error: Error, msg: str) -> Response:
    error = {
        "name": error.name,
        "code": error.value,
        "msg": msg
    }
    return response(error=error, success=False)


T1 = TypeVar("T1")
T2 = TypeVar("T2")


def cast_type(cls: Callable[[T1], T2], val: T2, default: Any = _DEFAULT) -> T2:
    try:
        val = cls(val)
    except Exception:
        if default is _DEFAULT:
            raise
        val = default
    return val
