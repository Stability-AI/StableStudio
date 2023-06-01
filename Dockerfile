FROM node:20-alpine

RUN apk update
RUN apk add git

RUN git clone https://github.com/Stability-AI/StableStudio.git
WORKDIR StableStudio

RUN yarn

ENTRYPOINT yarn dev --host
