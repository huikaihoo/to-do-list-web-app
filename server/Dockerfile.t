FROM node:18.16-alpine3.18 AS base
RUN apk update && apk add --no-cache tzdata

WORKDIR /opt/app
COPY ./server/package.json ./
COPY ./yarn.lock ./

RUN CI=1 yarn install

COPY ./server/tsconfig.json ./
COPY ./server/src ./src
COPY ./server/test ./test
