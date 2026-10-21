# Stage 1: Build Angular frontend
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# Normalize Angular's build output
RUN set -eux; \
    mkdir -p /app/output; \
    browser_dir="$(find /app/dist -type d -name browser -print -quit)"; \
    if [ -n "$browser_dir" ]; then \
        cp -a "$browser_dir"/. /app/output/; \
    else \
        index_file="$(find /app/dist -type f -name index.html -print -quit)"; \
        test -n "$index_file"; \
        output_dir="$(dirname "$index_file")"; \
        cp -a "$output_dir"/. /app/output/; \
    fi

# Stage 2: Serve Angular using Nginx
FROM nginx:alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/output/ /usr/share/nginx/html/

EXPOSE 80
