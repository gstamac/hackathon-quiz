# build environment
FROM node:13.12.0-alpine as build
WORKDIR /app

ENV NPM_TOKEN 6f8c4adf-832d-4fa1-8e4c-495e51130d3c
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH="/home/node/.npm-global/bin:${PATH}"

# install app dependencies
COPY ./build ./build

RUN npm install -g serve

CMD serve -s build -l $PORT
