"""Some utilities."""

from enum import IntEnum

from flask import jsonify


class Error(IntEnum):
    """Error codes."""

    GENERAL = 0
    INVALID_REQUEST = 1

    NO_TEXT_FOUND = 1001

    NO_SAMPLE_FOUND = 2001


def response(**kwargs):
    """Return a response."""
    data = kwargs
    data["success"] = kwargs.get("success", True)
    return jsonify(data)


def error_response(error, msg):
    """Return an error response."""
    error = {
        "name": error.name,
        "code": error.value,
        "msg": msg
    }
    return response(error=error, success=False)


def cast_type(cls, val, default):
    """Convert val to cls or return default."""
    try:
        val = cls(val)
    except Exception:
        val = default

    return val
