# docker build -t dartsass-plugin-common:10.16.3-alpine .

# https://hub.docker.com/_/node?tab=tags
# ARG NODE_VERSION=8.14.0-alpine
ARG NODE_VERSION=10.16.3-alpine
# Only specifically npm < 5.6 works for vsce.
# For more details refer to [vscode-vsce/issues/246](https://github.com/Microsoft/vscode-vsce/issues/246#issuecomment-379565583) .
FROM node:${NODE_VERSION}
RUN apk add python make g++
RUN node --version
RUN npm --version
RUN npm install -g npm
ENV TYPESCRIPT_VERSION=3.5.3
RUN npm install -g typescript@${TYPESCRIPT_VERSION}
ARG DEVEL_USER=develop
RUN cat /etc/os-release
RUN adduser -g "" -D  ${DEVEL_USER}

RUN adduser ${DEVEL_USER} node
RUN id ${DEVEL_USER}

USER ${DEVEL_USER}
WORKDIR /home/${DEVEL_USER}

RUN npm --version && tsc --version

WORKDIR /tmp

ENTRYPOINT /bin/sh -c "while true; do echo hello; sleep 100; done"
# docker-compose up --force-recreate -d --remove-orphans