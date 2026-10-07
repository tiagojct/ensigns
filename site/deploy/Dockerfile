# Run from the repository root, with the commit as build arguments. The build stops without them.
# docker build -f site/deploy/Dockerfile -t ensigns --build-arg COMMIT_SHA=$(git rev-parse HEAD) --build-arg COMMIT_DATE=$(git show -s --format=%cs HEAD) .
FROM node:24-alpine AS build
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# The footer names the commit. The workflow passes both values, and the build stops without them
# (scripts/site/stamp.ts). The arguments come after npm ci, so a new commit keeps that layer.
ARG COMMIT_SHA
ARG COMMIT_DATE
ENV ENSIGNS_REQUIRE_STAMP=1 ENSIGNS_COMMIT_SHA=${COMMIT_SHA} ENSIGNS_COMMIT_DATE=${COMMIT_DATE}
RUN npm run build

FROM nginx:alpine
COPY --from=build /src/site/dist /usr/share/nginx/html
COPY site/deploy/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80/ >/dev/null || exit 1
