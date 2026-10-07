// The deployment files are read by a person on the VPS, not by code, so this test keeps
// their promises in one place: the security headers on every response, the redirects from
// the old names, the shape the other apps on the box already use, and a workflow that only
// the owner can start.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { repoRoot } from "../../lib/model/load.ts";
import { RENAMED_FAMILIES } from "../../lib/model/renames.ts";
import { STAMP_ENV } from "../../scripts/site/stamp.ts";

const root = repoRoot();
const read = (path: string) => readFileSync(join(root, path), "utf8");
/** The file without its comment lines, so a comment cannot satisfy or break a check. */
const code = (path: string) => read(path).split("\n").filter((line) => !line.trim().startsWith("#")).join("\n");

describe("nginx.conf", () => {
  const nginx = code("site/deploy/nginx.conf");

  it("sets each security header once, at the server level", () => {
    for (const name of ["Content-Security-Policy", "X-Content-Type-Options", "Referrer-Policy", "Permissions-Policy", "X-Frame-Options"]) {
      expect(nginx.match(new RegExp(`add_header ${name} `, "g")), name).toHaveLength(1);
    }
  });

  it("sets no add_header inside a location, because that drops the server-level headers", () => {
    const locations = [...nginx.matchAll(/location\s+[^{]+\{([^}]*)\}/g)];
    expect(locations.length).toBeGreaterThan(3);
    for (const [block] of locations) expect(block, block).not.toContain("add_header");
  });

  it("redirects every old family name to the new one", () => {
    for (const [old, id] of Object.entries(RENAMED_FAMILIES)) {
      expect(nginx, old).toContain(`location = /${old}/ { return 301 /${id}/; }`);
    }
  });

  it("keeps redirects relative and serves the site's own 404 page", () => {
    expect(nginx).toContain("absolute_redirect off;");
    expect(nginx).toContain("error_page 404 /404/index.html;");
  });
});

describe("Caddy files", () => {
  const ensigns = code("site/deploy/Caddyfile.snippet");
  const gam = code("site/deploy/Caddyfile.gam-redirect.snippet");
  const tls = "tls /data/certs/selfsigned.crt /data/certs/selfsigned.key";

  it("serve the new host on http and on the self-signed https listener", () => {
    expect(ensigns).toMatch(/http:\/\/ensigns\.tiagojacinto\.eu \{\s+import route_ensigns\s+\}/);
    expect(ensigns).toMatch(/https:\/\/ensigns\.tiagojacinto\.eu \{\s+tls [^\n]+\s+import route_ensigns\s+\}/);
    expect(ensigns).toContain(tls);
    expect(ensigns).toContain("reverse_proxy ensigns:80");
    expect(ensigns).not.toContain("gam");
  });

  it("make the old host answer with permanent redirects only", () => {
    expect(gam).toContain("redir https://ensigns.tiagojacinto.eu{uri} permanent");
    expect(gam).toMatch(/http:\/\/gam\.tiagojacinto\.eu \{\s+import redirect_gam\s+\}/);
    expect(gam).toMatch(/https:\/\/gam\.tiagojacinto\.eu \{\s+tls [^\n]+\s+import redirect_gam\s+\}/);
    expect(gam).toContain(tls);
    expect(gam).not.toContain("reverse_proxy");
  });
});

describe("compose and tunnel files", () => {
  const compose = code("site/deploy/docker-compose.yml");

  it("run the published image on the external proxy network under watchtower, with no published port", () => {
    expect(compose).toContain("image: ghcr.io/tiagojct/ensigns:latest");
    expect(compose).toContain("container_name: ensigns");
    expect(compose).toMatch(/networks:\s+proxy:\s+external: true/);
    expect(compose).toContain('com.centurylinklabs.watchtower.enable: "true"');
    expect(compose).not.toMatch(/^\s*(ports|build):/m);
  });

  it("use the same health check as the Dockerfile", () => {
    expect(read("site/deploy/Dockerfile")).toContain("wget -qO- http://127.0.0.1:80/");
    expect(compose).toContain(`"wget", "-qO-", "http://127.0.0.1:80/"`);
  });

  it("send the new hostname through the tunnel to the self-signed listener", () => {
    const tunnel = code("site/deploy/cloudflared-ingress.yml");
    expect(tunnel).toContain("hostname: ensigns.tiagojacinto.eu");
    expect(tunnel).toContain("service: https://localhost:8443");
  });
});

describe("the image workflow", () => {
  const text = read(".github/workflows/build-deploy.yml");
  const guard = text.match(/if: >-\n([\s\S]*?)\n\s+runs-on:/)![1]!.replace(/\s+/g, " ");

  it("starts only by hand, and only on main", () => {
    expect(text.match(/\non:\n([\s\S]*?)\n\S/)![1]!.trim()).toBe("workflow_dispatch:");
    expect(guard).toContain("github.ref == 'refs/heads/main'");
  });

  it("runs only for the repository owner, on the first run and on a re-run", () => {
    expect(guard).toContain("github.actor == github.repository_owner");
    expect(guard).toContain("github.triggering_actor == github.repository_owner");
  });

  it("is recorded as the one exception to the rule that CI publishes nothing", () => {
    expect(read("docs/RELEASE.md")).toContain("No build or CI command publishes a package. The one exception is the build-deploy workflow");
  });

  it("pushes the image of this repository from the Dockerfile that exists", () => {
    expect(text).toContain("IMAGE: ghcr.io/${{ github.repository }}");
    const file = text.match(/file: (\S+)/)![1]!;
    expect(existsSync(join(root, file)), file).toBe(true);
  });

  it("pins every action to a full commit hash", () => {
    const uses = [...text.matchAll(/uses: (\S+)/g)].map((m) => m[1]!);
    expect(uses.length).toBeGreaterThan(3);
    for (const u of uses) expect(u, u).toMatch(/@[0-9a-f]{40}$/);
  });
});

describe("the commit stamp in the image", () => {
  const docker = code("site/deploy/Dockerfile");
  const workflow = read(".github/workflows/build-deploy.yml");
  const build = "--build-arg COMMIT_SHA=$(git rev-parse HEAD) --build-arg COMMIT_DATE=$(git show -s --format=%cs HEAD)";

  it("takes the commit as build arguments and stops the build without them", () => {
    expect(docker).toContain("ARG COMMIT_SHA");
    expect(docker).toContain("ARG COMMIT_DATE");
    expect(docker).toContain(`ENV ${STAMP_ENV.require}=1 ${STAMP_ENV.sha}=\${COMMIT_SHA} ${STAMP_ENV.date}=\${COMMIT_DATE}`);
  });

  it("sets the arguments after npm ci and before the build, so that a new commit keeps the dependency layer", () => {
    expect(docker.indexOf("RUN npm ci")).toBeGreaterThan(-1);
    expect(docker.indexOf("RUN npm ci")).toBeLessThan(docker.indexOf("ARG COMMIT_SHA"));
    expect(docker.indexOf("ARG COMMIT_DATE")).toBeLessThan(docker.indexOf("RUN npm run build"));
  });

  it("passes the commit and the date of that commit, not the date of the run", () => {
    expect(workflow).toContain(`git show -s --format=%cs "$GITHUB_SHA"`);
    expect(workflow).toContain("COMMIT_SHA=${{ github.sha }}");
    expect(workflow).toContain("COMMIT_DATE=${{ steps.commit.outputs.date }}");
    expect(workflow.indexOf("id: commit")).toBeLessThan(workflow.indexOf("docker/build-push-action"));
  });

  it("gives the Dockerfile, the runbook and the release notes a docker build command that passes both arguments", () => {
    expect(read("site/deploy/Dockerfile")).toContain(build);
    expect(read("site/deploy/README.md")).toContain(build);
    expect(read("docs/RELEASE.md")).toContain(build);
  });
});

describe("the runbook", () => {
  const readme = read("site/deploy/README.md");

  it("copies the files to the VPS and never leaves a shell in another folder", () => {
    expect(readme).toContain("rsync -a site/deploy/ <vps>:ensigns-deploy/");
    // Every folder change sits in a subshell, as (cd ... && ...), so later steps find the files.
    expect(readme).not.toMatch(/^\s*cd /m);
    for (const file of ["docker-compose.yml", "Caddyfile.snippet", "Caddyfile.gam-redirect.snippet"]) {
      expect(readme, file).toContain(`~/ensigns-deploy/${file}`);
    }
  });

  it("checks the tunnel's trust in the self-signed certificate before the restart", () => {
    expect(readme).toContain("originRequest");
    expect(read("site/deploy/cloudflared-ingress.yml")).toContain("originRequest");
  });

  it("starts the old container before it undoes the redirects", () => {
    const undo = readme.slice(readme.indexOf("## Undo"));
    const start = undo.indexOf("(cd /opt/vps/apps/gam && docker compose up -d)");
    expect(start).toBeGreaterThan(-1);
    expect(start).toBeLessThan(undo.indexOf("Steps 12 and 13"));
  });

  it("keeps the step that stops the old container where RETIREMENT.md says it is", () => {
    const n = read("docs/RETIREMENT.md").match(/stops at step (\d+) of site\/deploy\/README\.md/)![1];
    expect(readme).toMatch(new RegExp(`^${n}\\. When the new host has run without problems, stop the old container`, "m"));
  });
});
