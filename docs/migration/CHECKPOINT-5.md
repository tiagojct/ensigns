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

## Test report

On a clean checkout of this branch:

- npm run typecheck passes.
- npm test passes with Chromium required: 703 tests in 47 files. Phase 4 has 683 in 46 after its review fixes. The branch adds eighteen deployment tests and two site tests.
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
