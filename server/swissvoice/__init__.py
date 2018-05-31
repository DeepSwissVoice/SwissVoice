import logging.config

from . import config

logging.config.dictConfig(config.logging)

from .__info__ import *
from .swissvoice import app
