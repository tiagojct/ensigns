#!/bin/sh
# Start the nginx image with this repository's configuration and the built site, and check what the
# configuration promises: the security headers, the cache lifetimes, the redirects from the old names,
# the site's own 404 page and the compression of text and fonts. Run it from the repository root
# after npm run build, on a machine with Docker. CI runs it on every push and pull request.
set -eu

IMAGE=nginx:alpine
NAME=ensigns-nginx-check
PORT=${PORT:-8080}
BASE="http://127.0.0.1:$PORT"

docker run -d --rm --name "$NAME" -p "$PORT:80" \
  -v "$PWD/site/dist:/usr/share/nginx/html:ro" \
  -v "$PWD/site/deploy/nginx.conf:/etc/nginx/conf.d/default.conf:ro" \
  "$IMAGE" > /dev/null
trap 'docker stop "$NAME" > /dev/null 2>&1 || true' EXIT

up=no
for _ in $(seq 1 30); do
  if curl -fsS -o /dev/null "$BASE/" 2> /dev/null; then up=yes; break; fi
  sleep 1
done
if [ "$up" = no ]; then
  echo "nginx did not answer on $BASE"
  docker logs "$NAME" 2>&1 | tail -n 20
  exit 1
fi

docker exec "$NAME" nginx -t

fail=0
headers() { curl -s -D - -o /dev/null "$@" | tr -d '\r'; }
# expect <what the check shows> <text to search> <extended regular expression, case-insensitive>
expect() {
  if printf '%s\n' "$2" | grep -qiE "$3"; then
    echo "ok    $1"
  else
    echo "FAIL  $1"
    printf '%s\n' "$2" | sed 's/^/        /'
    fail=1
  fi
}

home=$(headers "$BASE/")
expect "the home page answers 200" "$home" '^HTTP/[0-9.]+ 200'
expect "the home page carries the content security policy" "$home" "^content-security-policy: default-src 'none'"
expect "the home page says nosniff" "$home" '^x-content-type-options: nosniff'
expect "the home page sets a referrer policy" "$home" '^referrer-policy: '
expect "the home page sets a permissions policy" "$home" '^permissions-policy: '
expect "the home page forbids framing by other sites" "$home" '^x-frame-options: SAMEORIGIN'
expect "the home page is always checked again" "$home" '^cache-control: no-cache'

script=$(basename "$(ls site/dist/assets/*.js | head -n 1)")
asset=$(headers "$BASE/assets/$script")
expect "a file under /assets/ carries the content security policy" "$asset" '^content-security-policy: '
expect "a file under /assets/ is cached for a year" "$asset" 'max-age=31536000'

gone=$(headers "$BASE/glauca/")
expect "/glauca/ answers 301" "$gone" '^HTTP/[0-9.]+ 301'
expect "/glauca/ goes to /goney/ without a host name" "$gone" '^location: /goney/$'

missing=$(headers "$BASE/no-such-page")
expect "a missing page answers 404" "$missing" '^HTTP/[0-9.]+ 404'
expect "a missing page carries the content security policy" "$missing" '^content-security-policy: '
expect "a missing page shows the site's own page" "$(curl -s "$BASE/no-such-page")" '<title>Page not found'

css=$(headers -H 'Accept-Encoding: gzip' "$BASE/catalogue.css")
expect "the style sheet is compressed" "$css" '^content-encoding: gzip'

ttf=$(ls site/dist/fonts/*.ttf | head -n 1)
font=$(headers -H 'Accept-Encoding: gzip' "$BASE/fonts/$(basename "$ttf")")
expect "a TrueType font has a font type" "$font" '^content-type: font/ttf'
expect "a TrueType font is compressed" "$font" '^content-encoding: gzip'
expect "a font is cached for 30 days" "$font" 'max-age=2592000'

exit "$fail"
