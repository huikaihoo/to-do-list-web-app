FROM node:18.16-alpine3.18 AS base
RUN apk update && apk add --no-cache tzdata

WORKDIR /opt/app
COPY ./server/package.json ./
COPY ./yarn.lock ./

FROM base AS builder
ENV NODE_ENV production
RUN CI=1 yarn install --production --prefer-offline && yarn cache clean

FROM base AS app-builder
COPY ./server/tsconfig.json ./
COPY ./server/tsconfig.build.json ./
RUN CI=1 yarn install
COPY ./server/src ./src
RUN yarn build

FROM builder
COPY --from=app-builder /opt/app/dist /opt/app/dist

EXPOSE 3001
CMD ["yarn", "start"]
