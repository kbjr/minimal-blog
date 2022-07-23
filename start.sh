#!/bin/sh

# note: this hmac secret value is here for example / local testing usage only.
# DO NOT deploy any version of this software to any environment using this secret value.
# GET YOUR OWN.
# This will generate a new, random string like this one:
# 
#     node -e 'console.log(require("crypto").randomBytes(128).toString("base64"))'
# 
export MB_AUTH_HMAC_SECRET="dXxTp2ioFXFXPttaX4aB5xZIIs7nwa0/iIOq7P1JmZS4gRyS2dHt+/E2UO2zvpLOY2VwpVDaZMGT9H+EX7PVEBPXp3FSSeYOu5JBpHVBjTGshYxk49ZPJexI0pKJiNfmh54hM4XZt1Y7IiBlBpInxSlptPxPoMajHjRN7El4FeQ="
# export MB_AUTH_SIGNING_KEY="/path/to/key/file"

# First-time-setup password. Change this before first-time deploying; Can be removed after setup
export MB_AUTH_SETUP_CODE="MUK7kBU1NUgliz8FKzlmvg=="

export MB_HTTP_WEB_PORT="3000"
export MB_HTTP_CTRL_PORT="3001"
export MB_HTTP_WEB_URL="http://localhost:$MB_HTTP_WEB_PORT"
export MB_HTTP_CTRL_URL="http://localhost:$MB_HTTP_CTRL_PORT"

export MB_HTTP_WEB_ENABLE_STATUS="1"
export MB_HTTP_CTRL_SWAGGER="1"

export MB_CACHE_ENABLE_ETAGS="1"
export MB_CACHE_ENABLE_CACHE_CONTROL="1"

export MB_DATA_STORAGE_TYPE="sqlite3"
export MB_DATA_DIR="$(dirname "$0")/data"

export MB_DATA_ENABLE_SEARCH="1"

export MB_COMPRESSION_ENABLE="1"
export MB_COMPRESSION_ENCODINGS="br,deflate,gzip"

export MB_LOG_LEVEL="debug"
export MB_LOG_PRETTY="1"

node ./build/start.js
