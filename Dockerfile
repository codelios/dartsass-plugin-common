# docker build -t dartsass-plugin-common:10.18.0-alpine .

# https://hub.docker.com/_/node?tab=tags
ARG NODE_VERSION=10.18.0-alpine
FROM node:${NODE_VERSION}
RUN apk add python make g++
RUN node --version
RUN npm --version
RUN npm install -g npm

# The version of 1.19.0 has no significance except that it is not the
# latest version of sass
# ( see package.json to confirm the latest version of sass ).
# Used primarily for testing purposes only.
RUN npm install -g sass@1.19.0

ENV TYPESCRIPT_VERSION=3.7.5
RUN npm install -g typescript@${TYPESCRIPT_VERSION}
ARG DEVEL_USER=develop
RUN cat /etc/os-release
RUN adduser -g "" -D  ${DEVEL_USER}

RUN adduser ${DEVEL_USER} node
RUN id ${DEVEL_USER}

USER ${DEVEL_USER}
WORKDIR /home/${DEVEL_USER}

RUN npm --version && tsc --version && sass --version

WORKDIR /tmp

ENTRYPOINT /bin/sh -c "while true; do echo hello; sleep 100; done"
# docker-compose up --force-recreate -d --remove-orphans