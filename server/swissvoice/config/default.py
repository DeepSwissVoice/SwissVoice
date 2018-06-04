ENVVARKEY = "SWISSVOICE_SETTINGS"

# GENERAL
MAX_REQUEST_COUNT = 50
MAX_PROPOSE_COUNT = 1000
STATISTICS_HISTORY_POINTS = 10 # the amount of history entries to return

# LOGGING
SENTRY_DSN = None

# DATABASE
MONGODB_URI = "mongodb://localhost:27017/"
DATABASE_NAME = "SwissVoice"

# STORAGE
S3_ENDPOINT_URL = None
S3_ACCESS_KEY = None
S3_SECRET_ACCESS_KEY = None
BUCKET_NAME = "swiss-voice"
RECORDING_KEY_PREFIX = "samples/"
RECORDING_LOCATION = None
