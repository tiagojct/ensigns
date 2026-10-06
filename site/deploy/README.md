# Deploying Ensigns

These files put the site on the VPS (Rokovoko) in the same way as the other apps on it. The chain is Cloudflare, then the tunnel, then Caddy on port 8443 with a self-signed certificate, then nginx in a container on the proxy network. Nothing here runs from this repository. The owner applies each step.

## Files

- Dockerfile builds the image from the repository root. It runs npm run build and copies site/dist into nginx.
- nginx.conf is the server block inside the image. It holds the Content Security Policy, the cache rules and the three redirects from the old family names.
- docker-compose.yml goes to /opt/vps/apps/ensigns/ on the VPS.
- Caddyfile.snippet serves the new host. Append it to /opt/vps/caddy/Caddyfile.
- Caddyfile.gam-redirect.snippet turns the old Gam host into a redirect. It replaces the old gam blocks.
- cloudflared-ingress.yml is one rule for /etc/cloudflared/config.yml.
- .github/workflows/build-deploy.yml builds the image and pushes it to ghcr.io/tiagojct/ensigns. Only the repository owner can start it, by hand, on main. It is the one workflow that publishes.

## Order of work

Do the steps in this order. The next section gives an undo for each step. Steps 6 to 14 run on the VPS. Their commands use full paths, so the current folder does not matter.

1. Wait until the ci workflow is green on main.
2. Open the Actions tab on GitHub. Start the build-deploy workflow on main. Wait until it finishes.
3. Open Packages on the GitHub profile, then the ensigns package, then Package settings. Change the visibility to public. The VPS pulls the image without credentials.
4. In Cloudflare, in the zone tiagojacinto.eu, add a proxied CNAME record named ensigns. Give it the same target as the existing gam record.
5. Copy the deploy files to the VPS. Run this on your machine, in a clone of the repository. Replace <vps> with the SSH name of the VPS. The files are then in ~/ensigns-deploy on the VPS.

   ```sh
   rsync -a site/deploy/ <vps>:ensigns-deploy/
   ```

6. On the VPS, make the app folder and start the container.

   ```sh
   mkdir -p /opt/vps/apps/ensigns
   cp ~/ensigns-deploy/docker-compose.yml /opt/vps/apps/ensigns/
   (cd /opt/vps/apps/ensigns && docker compose up -d)
   docker ps --filter name=ensigns
   ```

   The status must say healthy after about 30 seconds.
7. Test the container from the Caddy container.

   ```sh
   docker exec caddy wget -qO- http://ensigns:80/ | head -n 5
   ```

8. Save the Caddyfile, append Caddyfile.snippet to it, check it and reload Caddy.

   ```sh
   cp /opt/vps/caddy/Caddyfile /opt/vps/caddy/Caddyfile.before-ensigns
   cat ~/ensigns-deploy/Caddyfile.snippet >> /opt/vps/caddy/Caddyfile
   docker exec caddy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
   docker exec caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
   ```

9. Add the tunnel rule. Caddy uses a self-signed certificate, and the tunnel must accept it. The settings that make this work for the gam rule are not in this repository, so they are not verified. Do these checks first.
   - Open /etc/cloudflared/config.yml and find the rule for gam.tiagojacinto.eu.
   - If that rule has an originRequest block, for example noTLSVerify: true, copy the block into the new rule. The file ~/ensigns-deploy/cloudflared-ingress.yml shows where it goes.
   - If the file has one originRequest block at the top level, the new rule needs none.

   Then add the rule before the last rule, http_status:404. Write the whole file back. Restart cloudflared. If the check in step 10 fails, read the cloudflared log before you change anything else.
10. Check the new host.

    ```sh
    curl -sI https://ensigns.tiagojacinto.eu/ | grep -iE '^(HTTP|content-security-policy|x-content-type-options|cache-control)'
    curl -sI https://ensigns.tiagojacinto.eu/glauca/ | grep -iE '^(HTTP|location)'
    curl -s -o /dev/null -w '%{http_code}\n' https://ensigns.tiagojacinto.eu/no-such-page
    ```

    The first command must show 200 and all three headers. The second must show 301 and location /goney/. The third must show 404. Then open https://ensigns.tiagojacinto.eu/carpenter/?family=glauca. The family list must show Goney.
11. Check one file under /assets/ with curl -sI. It must carry the same Content Security Policy and nosniff headers, and a cache-control of one year.
12. Redirect the old host. Save the Caddyfile. Edit a copy: delete the (route_gam) snippet and the two gam blocks, and put the content of ~/ensigns-deploy/Caddyfile.gam-redirect.snippet in their place. Write the copy back with cat, so that the file keeps its inode. Check the file and reload Caddy.

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
13. Add the same redirect at the Cloudflare edge. Cloudflare keeps files of the old host (/assets/, /fonts/, images) for up to a year, and a redirect at the origin does not replace them. In the zone tiagojacinto.eu, add a Single Redirect rule.
    - When: the hostname equals gam.tiagojacinto.eu.
    - Then: a dynamic redirect to concat("https://ensigns.tiagojacinto.eu", http.request.uri.path), status 301, with the option to preserve the query string.

    Then purge the cache for the hostname gam.tiagojacinto.eu. Check with curl -sI http://gam.tiagojacinto.eu/assets/any-name. It must show 301.
14. When the new host has run without problems, stop the old container. Keep its folder until the old repository is archived.

    ```sh
    (cd /opt/vps/apps/gam && docker compose down)
    ```

## Undo

- Step 14: start the old container again, and wait until it is healthy, before you undo steps 12 and 13. Without it, the restored Caddy block points at a container that does not exist, and the old host returns an error instead of the old site. The old image stays in the registry until you delete the package.

  ```sh
  (cd /opt/vps/apps/gam && docker compose up -d)
  docker ps --filter name=gam
  ```

- Steps 12 and 13: the old container must run first. Copy /opt/vps/caddy/Caddyfile.before-redirect back with cat, reload Caddy, and delete the Cloudflare rule.
- Steps 6 to 11: stop the container, copy /opt/vps/caddy/Caddyfile.before-ensigns back with cat, reload Caddy, remove the cloudflared rule, restart cloudflared, and delete the ensigns DNS record.

  ```sh
  (cd /opt/vps/apps/ensigns && docker compose down)
  ```

## Not checked here

- The build host has no nginx, Caddy or Docker. Test the files where they run. On a machine with Docker, these two commands check the image and the server block.

  ```sh
  docker build -f site/deploy/Dockerfile -t ensigns:test .
  docker run --rm -v "$PWD/site/deploy/nginx.conf:/etc/nginx/conf.d/default.conf:ro" nginx:alpine nginx -t
  ```

  The build stage was run without Docker, on a copy of the tracked files with no .git folder and no legacy folder. npm ci and npm run build both passed.
- The origin certificate setting of the tunnel (step 9) was not read from the VPS.
- Strict-Transport-Security is not set, and Cloudflare Always Use HTTPS is off for the zone. Decide both before the old host goes away.
- The base images are not pinned to a digest. Watchtower follows our own image only.
