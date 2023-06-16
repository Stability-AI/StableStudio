#!/bin/bash
cd "$(dirname "$0")" || exit

if [ "$1" = "--docker" ]; then
  APP_NAME="stablestudio-ui"
  yarn install
  yarn build
  docker image build -t $APP_NAME -f ./packages/$APP_NAME/Dockerfile ./packages/$APP_NAME/
  docker run -d --name $APP_NAME -p 3000:80 $APP_NAME
else
  yarn install
  yarn dev
fi