import ast
import logging
import os
import sys
from typing import Any, Dict

log = logging.getLogger(__name__)


class EnvConfig:
    def __init__(self, prefix: str, obj=None):
        env: Dict[str, str] = obj or os.environ.copy()
        for key, value in env.items():
            if key.startswith(prefix):
                actual_key = key[len(prefix):]
                try:
                    actual_value = EnvConfig.parse_value(value)
                except SyntaxError as e:
                    log.warning(f"Couldn't parse value of key \"{key}\": \"{value}\" ({e})")
                    continue
                setattr(self, actual_key, actual_value)

    @staticmethod
    def parse_value(value: str) -> Any:
        return ast.literal_eval(value)


sys.modules[__name__] = EnvConfig("SW_")
