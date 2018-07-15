__all__ = ["SwissJsonEncoder", "Error", "response", "error_response", "bool_param", "cast_type"]

from enum import IntEnum
from typing import Any, Callable, Optional, TypeVar

from bson import ObjectId
from flask import Response, jsonify
from flask.json import JSONEncoder

_DEFAULT = object()


class SwissJsonEncoder(JSONEncoder):
    # pylint: disable=E0202
    def default(self, o: Any) -> Any:
        if isinstance(o, ObjectId):
            return str(o)
        return super().default(o)


class Error(IntEnum):
    GENERAL = 0
    INVALID_REQUEST = 1

    REGION_INVALID = 101

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


def bool_param(val: str) -> Optional[bool]:
    if not isinstance(val, str):
        return None

    val = val.lower()
    return (
        True if val in {"u", "up", "y", "yes", "true", "t", "1"} else
        False if val in {"d", "down", "n", "no", "false", "f", "0"} else
        None
    )


def cast_type(cls: Callable[[T1], T2], val: T2, default: Any = _DEFAULT) -> T2:
    try:
        val = cls(val)
    except Exception:
        if default is _DEFAULT:
            raise
        val = default
    return val
