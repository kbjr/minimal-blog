
FROM node:16-alpine

ENV HTTP_WEB_PORT=3000
ENV HTTP_CTRL_PORT=3001
ENV HTTP_WEB_URL=http://localhost:3000
ENV HTTP_CTRL_URL=http://localhost:3001

ENV DATA_PATH=/data
ENV BLOG_PATH=/var/blog

EXPOSE ${HTTP_WEB_PORT}/tcp ${HTTP_CTRL_PORT}/tcp
VOLUME ${DATA_PATH}
WORKDIR ${BLOG_PATH}

COPY src/  ${BLOG_PATH}/src/
COPY templates/  ${BLOG_PATH}/templates/
COPY package.json tsconfig.json ${BLOG_PATH}/

# Install build dependencies for sqlite3
RUN [ "apk", "add", "python2", "g++", "make" ]

# Install dependencies and build the application
RUN [ "npm", "install" ]
RUN [ "npm", "run", "build" ]

# Now that everything is built, prune node_modules down to only
# the production dependencies and delete any unneeded files
RUN [ "npm", "install", "--only=production" ]
RUN [ "rm", "-rf", "src", "package.json", "tsconfig.json" ]
# "package-lock.json"

ENTRYPOINT [ "node", "build/start.js" ]
