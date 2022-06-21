
FROM node:16-alpine


# === Auth Config ===
# There are three different options for token signing:
# 1) User-provided HMAC signing secret; If provided, this value will be read as
# as base-64 string, and used as the HMAC secret to sign tokens.
ENV AUTH_HMAC_SECRET=""
# 2) User-provided private key file; If provided, this value will be read as a
# file path pointing to a private key file, and used to sign tokens.
ENV AUTH_SIGNING_KEY=""
# 3) If neither of the above are provided, the container will generate a random
# string to use as an HMAC secret. In this mode, because the secret is not
# persisted anywhere and is regenerated on reboot, tokens will not remain valid
# across server restarts.


# === HTTP Config ===
# 
ENV HTTP_WEB_PORT=3000
# 
ENV HTTP_CTRL_PORT=3001
# 
ENV HTTP_WEB_URL=http://localhost:3000
# 
ENV HTTP_CTRL_URL=http://localhost:3001


# === Caching Config ===
# 
ENV CACHE_ENABLE_ETAGS="1"
# 
ENV CACHE_ENABLE_CACHE_CONTROL="1"


# === Response Compression Config ===
# 
ENV COMPRESSION_ENABLE="1"
# 
ENV COMPRESSION_ENCODINGS="br,deflate,gzip"


# === Data Storage Config ===
# The "sqlite3" implementation is currently the only supported storage type.
ENV DATA_STORAGE_TYPE="sqlite3"
# The directory where persistent data storage will be written. If you want
# your data to persist between restarts (likely), you'll want this to point
# to a persistent volume of some kind.
ENV DATA_PATH=/data


# === Enable / Disable Features ===
# Controls whether or not to enable content search.
ENV DATA_ENABLE_SEARCH="1"
# Controls whether the basic healthcheck / status endpoint is accessible on
# the public web server at "{HTTP_WEB_URL}/.status".
ENV HTTP_WEB_ENABLE_STATUS="1"
# Controls whether or not the control API swagger documentation page is
# enabled and accessible at "{HTTP_CTRL_URL}/api/docs".
ENV HTTP_CTRL_SWAGGER="1"


# === Application Install Path ===
# This is the location in the container that the application code will
# be installed into.
ENV BLOG_PATH=/var/blog


# === End of Configurable Values ===


EXPOSE ${HTTP_WEB_PORT}/tcp ${HTTP_CTRL_PORT}/tcp
VOLUME ${DATA_PATH}
WORKDIR ${BLOG_PATH}

COPY src/  ${BLOG_PATH}/src/
COPY assets/  ${BLOG_PATH}/assets/
COPY package.json tsconfig.json ${BLOG_PATH}/

# Install build dependencies for sqlite3 / pikchr
#  see: https://github.com/gliderlabs/docker-alpine/blob/master/docs/usage.md (re: `--no-cache` flag)
RUN [ "apk", "add", "--no-cache", "python3", "g++", "make" ]

# Install dependencies and build the application
RUN [ "npm", "install" ]
RUN [ "npm", "run", "build" ]

# Now that everything is built, prune node_modules down to only
# the production dependencies and delete any unneeded files
RUN [ "npm", "install", "--only=production" ]
RUN [ "rm", "-rf", "src", "package.json", "tsconfig.json" ]
# "package-lock.json"

ENTRYPOINT [ "node", "build/start.js" ]
