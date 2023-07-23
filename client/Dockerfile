FROM node:18.16-alpine3.18 AS base
RUN apk update && apk add --no-cache tzdata

WORKDIR /opt/app
COPY ./client/package.json ./
COPY ./yarn.lock ./

RUN yarn install

COPY ./client/tsconfig.json ./
COPY ./client/public ./public
COPY ./client/src ./src

RUN yarn build

FROM nginx:1.25-alpine
RUN apk update && apk add --no-cache tzdata

COPY ./client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=base /opt/app/build /app

EXPOSE 3000
