# Dockerfile for Hugo site with Hextra theme
FROM hugo:0.164.0-extended-alpine AS builder

# Install git (needed for Hugo themes)
RUN apk add --no-cache git

# Copy the entire project
WORKDIR /src
COPY . .

# Build the site
RUN hugo --minify --cleanDestinationDir

# Use a lightweight web server to serve the site
FROM nginx:alpine

# Copy the built site from the builder
COPY --from=builder /src/public /usr/share/nginx/html

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]