# Use the official nginx image as the base image
FROM nginx:1.18.0

# Set the working directory
WORKDIR /stablestudio-ui

# Copy the stablestudio-ui application code
COPY ./dist ./

COPY ./nginx-default.conf /etc/nginx/conf.d/default.conf

# Expose the port the app will run on
EXPOSE 80