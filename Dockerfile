# pull official base image
FROM node:13.12.0-alpine

ENV NPM_TOKEN 6f8c4adf-832d-4fa1-8e4c-495e51130d3c

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
COPY .npmrc ./
RUN npm install
RUN npm install react-scripts@3.4.1 -g

# add app
COPY . ./

# start app
CMD ["npm", "start"]