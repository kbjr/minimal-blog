#!/bin/sh

export HTTP_WEB_PORT="3000"
export HTTP_CTRL_PORT="3001"
export HTTP_WEB_URL="http://localhost:$HTTP_WEB_PORT"
export HTTP_CTRL_URL="http://localhost:$HTTP_CTRL_PORT"
export HTTP_WEB_ENABLE_STATUS="1"
export HTTP_CTRL_SWAGGER="1"
export CACHE_ENABLE_ETAGS="1"
export CACHE_ENABLE_CACHE_CONTROL="1"
export DATA_STORAGE_TYPE="sqlite3"
export DATA_DIR="$(dirname "$0")/data"
export COMPRESSION_ENABLE="1"
export COMPRESSION_ENCODINGS="br,deflate,gzip"
export LOG_LEVEL="debug"
export LOG_PRETTY="1"

node ./build/start.js
