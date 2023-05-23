# this can be updated to use a smaller image, customize build steps&stages, etc
FROM node:latest
ENV APP_PORT=3000
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
COPY . .
RUN yarn
RUN echo "cachebust_1"
EXPOSE $APP_PORT
CMD ["yarn", "dev"]
