import logging.config

import raven
from flask import Flask
from raven.conf import setup_logging
from raven.contrib.flask import Sentry
from raven.handlers.logging import SentryHandler

from . import __version__, config

log = logging.getLogger(__name__)


def get_app():
    app = Flask("SwissVoice")
    log.debug("Loading config")
    app.config.from_object(config.default)
    app.config.from_object(config.environment)

    log.debug("setting up Sentry...")
    sentry_client = raven.Client(app.config["SENTRY_DSN"], release=__version__)
    Sentry(app, sentry_client)
    sentry_handler = SentryHandler(sentry_client)
    sentry_handler.setLevel(logging.ERROR)
    setup_logging(sentry_handler)

    log.info("app setup!")

    return app
