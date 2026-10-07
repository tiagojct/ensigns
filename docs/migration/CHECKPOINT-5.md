# Ensigns checkpoint 5: deployment and retirement, prepared

Prepared on 2026-10-06. This records the preparation for phase 5. Nothing was deployed, published or changed outside this repository, and the five old repositories were not touched. The brief holds the deployment until the owner approves here. The owner then runs it with site/deploy/README.md, because this work has no access to the VPS.

## What changed

Branch phase/5-deployment-and-retirement, stacked on phase/4-generators-packages-site.

- The Carpenter accepts old family ids in ?family=. The brief asked for it, and phase 4 ignored them and showed the first family. One map in lib/model/renames.ts also feeds the redirect pages for /glauca/, /try-works/ and /ambergris/.
- site/deploy follows the shape of the other apps on the VPS again: the proxy network, the ghcr.io image, the watchtower label, and the self-signed listener on port 8443 behind the Cloudflare tunnel. The old Gam host has its own Caddy file. It replaces the old blocks and redirects every path with a 301.
- nginx.conf carried two faults that the Gam inventory had found. Files under /assets/ went out without the security headers, and two Cache-Control lines were sent. Both are fixed, and the 30-day font cache is back.
- The build-deploy workflow builds the image and pushes it to ghcr.io/tiagojct/ensigns. Only the repository owner can start it, by hand, on main: the job checks the actor and the triggering actor, so a re-run by someone else stops too. It is the one place where CI publishes, an exception to the rule in docs/RELEASE.md that D38 asks you to confirm. It has pinned actions and one platform, linux/amd64.
- site/deploy/README.md gives the order of work, a check after each step and the undo for each step. It stages the files on the VPS first, checks the tunnel's trust in Caddy's self-signed certificate before the restart, and starts the old container again before it undoes the redirects.
- docs/RETIREMENT.md gives the README notice for each old repository, the archive steps, the package follow-ups and the consumer follow-ups.
- The site is redesigned around the ensigns. Each family has a signal flag drawn from its own colours, in one of ten designs. The host ship leads the home page with its crew, the nine ships follow in book order, and a family page opens in the family's own ground. The headline is "Colour, tested where it is read." and the headings are set in a subset of Literata (77 KB, with the licence and the hashes recorded in site/public/fonts). The sample cards quote chapter 1 and print the measured contrast of the text, the link, the button label and the focus ring. The Carpenter shows its tool above the fold. The favicon and the share image use the same mark and the ten flags.
- A test now reads the text of every page, review page and specimen and fails on the markers of generated prose: antithesis, staccato negation, magic adverbs, inflated words, filler transitions, stock phrases, headings that ask a question, more than two em dashes, arrows, curly quotes and emoji. On the existing text it found only typographic apostrophes, which are now straight.

## Test report

On a clean checkout of this branch:

- npm run typecheck passes.
- npm test passes with Chromium required: 716 tests in 49 files. Phase 4 has 683 in 46 after its review fixes. The branch adds eighteen deployment tests, two site tests, three copy tests and ten design tests.
- npm run build and node scripts/export/freshness.ts pass.
- The image build stage ran without Docker, on a copy of the tracked files with no .git folder and no legacy folder. npm ci and npm run build passed, and site/dist held every page.
- Each new check fails when its rule is broken. I tested this by removing the old-id mapping, adding add_header to a location, dropping a family redirect, adding a push trigger to the workflow and unpinning an action.

## Not done

- No file was run through nginx, Caddy or Docker. None is installed on this machine, and the sandbox cannot reach Docker Hub. site/deploy/README.md gives the commands that check them where they run.
- No deployment, DNS record, Cloudflare rule, registry change or change to an old repository.
- The five pequod 0.3.0 releases are not prepared. They come from the old pequod repository, which this work may not change.

## Gaps against the brief, found while preparing and not fixed here

- Build footer. The brief asks for the collection version, the commit SHA, the date and each family's version. Family pages show their own version. The footer shows none of the four. The build is byte-identical on purpose, so a date would break the freshness check, and a commit SHA needs a build argument, because the image build has no .git folder. The old site printed unknown for that reason.
- CI. The brief lists R CMD check and pytest in CI. ci.yml runs neither. Both ran by hand for checkpoint 4.
- Old download paths. The old host served files under /official/<id>/. They have no counterpart. After the redirect, those paths return 404 on the new host.

## Decisions needed

CHECKPOINT-3.md lists the earlier open decisions, D2 and D22 to D32. New ones:

- D33. How long gam.tiagojacinto.eu redirects. Proposal: at least 24 months, then decide from the Cloudflare request count.
- D34. The build footer. Proposal: the workflow passes the commit SHA and the commit date as build arguments. The build stops if they are missing, and the footer prints them with the collection version and the family versions. A local build prints no date and stays repeatable.
- D35. CI jobs for R CMD check and pytest. Proposal: add both, and run them on pull requests.
- D36. The old /official/ paths. Proposal: read the Cloudflare request count for those paths on the old host first. Redirect them to the family pages only if requests exist.
- D37. Transport security. HSTS is not set, and Cloudflare Always Use HTTPS is off. Proposal: turn on Always Use HTTPS for both hosts, and add HSTS after a month without mixed-content problems.
- D38. The image. The build-deploy workflow is the one place where CI publishes. It pushes the site image to ghcr.io/tiagojct/ensigns, and only when the repository owner starts it by hand on main. It targets linux/amd64 only, because the VPS is amd64. The base images are not pinned to a digest. The GHCR package must be public, because the VPS pulls it without credentials. Proposal: keep these choices, or remove the push and push the image from your own machine.

## Approval

Say whether to go ahead with the deployment. After that, follow site/deploy/README.md, and then docs/RETIREMENT.md. Pull requests 1 to 4 are open, and CI is green on each. Merge them in order, each with a merge commit, before the image workflow can run on main.

## Outcome, 2026-10-07

The owner approved the deployment on 2026-10-07. The text above stays as it was written on 2026-10-06. This section records what happened.

- Pull requests 1 to 4 were merged in order, each with a merge commit. The build-deploy workflow ran on main at 3477a91 and succeeded in 1 minute 22 seconds, which also shows that the Docker build works on node:24-alpine. The GHCR package was made public.
- The proxied CNAME ensigns was added in the zone tiagojacinto.eu, with the same target as gam. The container, the Caddy blocks and the tunnel rule went onto the VPS (steps 5 to 9). The tunnel config has one top-level originRequest block with noTLSVerify: true, so the new rule needed none of its own.
- Steps 10 and 11 passed through Cloudflare. The home page answers 200 with the Content Security Policy and nosniff headers. A file under /assets/ carries the same headers and a cache-control of one year. /glauca/ answers 301 to /goney/, a missing page answers 404, and /carpenter/?family=glauca selects Goney.
- Steps 12 to 14 were done the same day. gam.tiagojacinto.eu answers 301 to the same path on the new host, at Caddy and through a Cloudflare Single Redirect rule that keeps the query string. The old container was stopped and removed, and its image and folder stay on the VPS.
- The repository was made public the same day. A scan of the full history found no tokens or keys.
- The notices and the archive of the five old repositories (docs/RETIREMENT.md, sections 2 and 3) were done the same day. Nothing was published to a registry.
- Loomings, social and vault were checked before and after each change and answered the same.
- docs/migration/DECISIONS.md records the outcome for D2 and D22 to D38.
