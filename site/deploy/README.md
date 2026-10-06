# Deploying Ensigns

These files put the site on the VPS (Rokovoko) in the same way as the other apps on it. The chain is Cloudflare, then the tunnel, then Caddy on port 8443 with a self-signed certificate, then nginx in a container on the proxy network. Nothing here runs from this repository. The owner applies each step.

## Files

- Dockerfile builds the image from the repository root. It runs npm run build and copies site/dist into nginx.
- nginx.conf is the server block inside the image. It holds the Content Security Policy, the cache rules and the three redirects from the old family names.
- docker-compose.yml goes to /opt/vps/apps/ensigns/ on the VPS.
- Caddyfile.snippet serves the new host. Append it to /opt/vps/caddy/Caddyfile.
- Caddyfile.gam-redirect.snippet turns the old Gam host into a redirect. It replaces the old gam blocks.
- cloudflared-ingress.yml is one rule for /etc/cloudflared/config.yml.
- .github/workflows/build-deploy.yml builds the image and pushes it to ghcr.io/tiagojct/ensigns. The owner starts it by hand.

## Order of work

Do the steps in this order. The next section gives an undo for each step.

1. Wait until the ci workflow is green on main.
2. Open the Actions tab on GitHub. Start the build-deploy workflow on main. Wait until it finishes.
3. Open Packages on the GitHub profile, then the ensigns package, then Package settings. Change the visibility to public. The VPS pulls the image without credentials.
4. In Cloudflare, in the zone tiagojacinto.eu, add a proxied CNAME record named ensigns. Give it the same target as the existing gam record.
5. On the VPS, make the folder and start the container.

   ```sh
   mkdir -p /opt/vps/apps/ensigns
   cp docker-compose.yml /opt/vps/apps/ensigns/
   cd /opt/vps/apps/ensigns && docker compose up -d
   docker ps --filter name=ensigns
   ```

   The status must say healthy after about 30 seconds.
6. Test the container from the Caddy container.

   ```sh
   docker exec caddy wget -qO- http://ensigns:80/ | head -n 5
   ```

7. Save the Caddyfile, append Caddyfile.snippet to it, check it and reload Caddy.

   ```sh
   cp /opt/vps/caddy/Caddyfile /opt/vps/caddy/Caddyfile.before-ensigns
   cat Caddyfile.snippet >> /opt/vps/caddy/Caddyfile
   docker exec caddy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
   docker exec caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
   ```

8. Add the rule in cloudflared-ingress.yml to /etc/cloudflared/config.yml. Put it before the last rule, http_status:404. Write the whole file back. Restart cloudflared.
9. Check the new host.

   ```sh
   curl -sI https://ensigns.tiagojacinto.eu/ | grep -iE '^(HTTP|content-security-policy|x-content-type-options|cache-control)'
   curl -sI https://ensigns.tiagojacinto.eu/glauca/ | grep -iE '^(HTTP|location)'
   curl -s -o /dev/null -w '%{http_code}\n' https://ensigns.tiagojacinto.eu/no-such-page
   ```

   The first command must show 200 and all three headers. The second must show 301 and location /goney/. The third must show 404. Then open https://ensigns.tiagojacinto.eu/carpenter/?family=glauca. The family list must show Goney.
10. Check one file under /assets/ with curl -sI. It must carry the same Content Security Policy and nosniff headers, and a cache-control of one year.
11. Redirect the old host. Save the Caddyfile. Edit a copy: delete the (route_gam) snippet and the two gam blocks, and put the content of Caddyfile.gam-redirect.snippet in their place. Write the copy back with cat, so that the file keeps its inode. Check the file and reload Caddy.

    ```sh
    cp /opt/vps/caddy/Caddyfile /opt/vps/caddy/Caddyfile.before-redirect
    cp /opt/vps/caddy/Caddyfile ~/Caddyfile.new
    # edit ~/Caddyfile.new as described above
    cat ~/Caddyfile.new > /opt/vps/caddy/Caddyfile
    docker exec caddy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
    docker exec caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
    curl -sI https://gam.tiagojacinto.eu/about/ | grep -iE '^(HTTP|location)'
    curl -sI http://gam.tiagojacinto.eu/about/ | grep -iE '^(HTTP|location)'
    ```

    Both checks must show 301 and location https://ensigns.tiagojacinto.eu/about/.
12. Add the same redirect at the Cloudflare edge. Cloudflare keeps files of the old host (/assets/, /fonts/, images) for up to a year, and a redirect at the origin does not replace them. In the zone tiagojacinto.eu, add a Single Redirect rule.
    - When: the hostname equals gam.tiagojacinto.eu.
    - Then: a dynamic redirect to concat("https://ensigns.tiagojacinto.eu", http.request.uri.path), status 301, with the option to preserve the query string.

    Then purge the cache for the hostname gam.tiagojacinto.eu. Check with curl -sI http://gam.tiagojacinto.eu/assets/any-name. It must show 301.
13. When the new host has run without problems, stop the old container. Keep its folder until the old repository is archived.

    ```sh
    cd /opt/vps/apps/gam && docker compose down
    ```

## Undo

- Steps 11 and 12: copy /opt/vps/caddy/Caddyfile.before-redirect back with cat, reload Caddy, and delete the Cloudflare rule. The gam container runs until step 13, so the old site comes back at once.
- Steps 5 to 10: run docker compose down in /opt/vps/apps/ensigns. Copy /opt/vps/caddy/Caddyfile.before-ensigns back with cat, reload Caddy, remove the cloudflared rule, restart cloudflared, and delete the ensigns DNS record.

## Not checked here

- The build host has no nginx, Caddy or Docker. Test the files where they run. On a machine with Docker, these two commands check the image and the server block.

  ```sh
  docker build -f site/deploy/Dockerfile -t ensigns:test .
  docker run --rm -v "$PWD/site/deploy/nginx.conf:/etc/nginx/conf.d/default.conf:ro" nginx:alpine nginx -t
  ```

  The build stage was run without Docker, on a copy of the tracked files with no .git folder and no legacy folder. npm ci and npm run build both passed.
- Strict-Transport-Security is not set, and Cloudflare Always Use HTTPS is off for the zone. Decide both before the old host goes away.
- The base images are not pinned to a digest. Watchtower follows our own image only.
