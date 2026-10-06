# Retiring the old repositories

This file lists what the owner does, after Ensigns is live, to retire gam, pequod, glauca, try-works and ambergris. The build and this repository do none of it. Do the work in the order below. Do not archive a repository before its notice is committed, because an archived repository takes no commits.

## Before you start

1. Make the ensigns repository public. It is private today. The notices and the package metadata link to it.
2. Check that https://ensigns.tiagojacinto.eu is live and that gam.tiagojacinto.eu redirects to it. site/deploy/README.md gives the steps.
3. Publish the ensigns packages that the next section names. docs/RELEASE.md gives the steps.

## 1. Published packages

Five listings carry the name pequod. Their usage is small: 435 CRAN downloads in a month, 18 on npm, 4 on PyPI, 75 installs on the VS Code Marketplace and 870 downloads on Open VSX. Checkpoint 1 gave the plan (D6). Follow it in this order.

1. Publish one last version, 0.3.0, on each registry. It carries the corrected Pequod values, and its README, DESCRIPTION or listing points to Ensigns. Every listing today links to https://tiagojct.eu/projects/pequod/, which returns 404. Only a new release changes that field.
2. When ensigns is live on CRAN, PyPI and npm, publish nothing more under the old names except fixes.
3. Deprecate where the registry allows it.
4. Do not write thin wrappers. They add a dependency chain and a second CRAN submission for no gain.

| Registry | Name | Latest | After the 0.3.0 release |
|---|---|---|---|
| CRAN | pequod | 0.2.0 | Keep the package. Archiving breaks dependants, and CRAN does not allow renames. |
| PyPI | pequod | 0.2.0 | Add the classifier Development Status :: 7 - Inactive to 0.3.0. PyPI has no deprecation flag. |
| npm | pequod-tailwind | 0.2.0 | Run npm deprecate pequod-tailwind "Replaced by @tiagojct/ensigns. See https://ensigns.tiagojacinto.eu" once @tiagojct/ensigns is on npm. |
| VS Code Marketplace | tiagojct.pequod-color-theme | 0.2.0 | Name tiagojct.ensigns as the replacement in the Deprecated extensions discussion thread. Users then get a Migrate button. Check the current process first. |
| Open VSX | tiagojct/pequod-color-theme | 0.2.0 | Check the current deprecation option at that time. |

This repository does not build the five 0.3.0 releases. They come from the old pequod repository, and the brief does not let this work change it. The corrected values are in families/pequod/pequod.tokens.json, and families/pequod/CHANGELOG.md lists each change. Decide whether to make these releases before step 3 below, because the repository takes no commits after the archive. Without them, the listings keep the dead project link and the accents that fail WCAG AA.

Nothing was published from glauca, try-works or ambergris. They need no registry work.

## 2. The notice in each README

Commit one of these paragraphs at the top of the README on main of each old repository.

gam:

```text
This repository is archived. Gam is now the Ensigns site at https://ensigns.tiagojacinto.eu, and gam.tiagojacinto.eu redirects there. The code and the colour families are in https://github.com/tiagojct/ensigns.
```

pequod:

```text
This repository is archived. Pequod is now a family in Ensigns: https://github.com/tiagojct/ensigns/tree/main/families/pequod. Ensigns has ten families and builds every file from one token file per family. Version 0.3.0 is the last release of the packages pequod (CRAN and PyPI), pequod-tailwind (npm) and the Pequod Palette extension. New work is at https://ensigns.tiagojacinto.eu/pequod/.
```

glauca:

```text
This repository is archived. Glauca is now Goney, a family in Ensigns: https://github.com/tiagojct/ensigns/tree/main/families/goney. The changelog of the family lists what changed from Glauca 0.1.0. Downloads and specimen: https://ensigns.tiagojacinto.eu/goney/.
```

try-works:

```text
This repository is archived. Try-Works is now Jungfrau, a family in Ensigns: https://github.com/tiagojct/ensigns/tree/main/families/jungfrau. The changelog of the family lists what changed from Try-Works 1.0.0. Downloads and specimen: https://ensigns.tiagojacinto.eu/jungfrau/.
```

ambergris:

```text
This repository is archived. Ambergris is now Rosebud, a family in Ensigns: https://github.com/tiagojct/ensigns/tree/main/families/rosebud. The changelog of the family lists what changed from Ambergris 0.3.0. Downloads and specimen: https://ensigns.tiagojacinto.eu/rosebud/.
```

## 3. Archive

Do these steps for each repository, after its notice is on main.

1. List the open issues and pull requests. Close or move each one.

   ```sh
   gh issue list -R tiagojct/gam
   gh pr list -R tiagojct/gam
   ```

2. Set the website and the description. Then archive.

   ```sh
   gh repo edit tiagojct/gam --homepage https://ensigns.tiagojacinto.eu --description "Archived. Moved to Ensigns."
   gh repo archive tiagojct/gam --yes
   ```

Repeat for pequod, glauca, try-works and ambergris. For the homepage, use the page of the family: /pequod/, /goney/, /jungfrau/ or /rosebud/ on https://ensigns.tiagojacinto.eu.

Do not delete, rename or make private any of the five. Archived repositories stay public and can be cloned. A deletion or a private setting breaks every link and every package field that points to them.

## 4. The old Gam host

Proposal (D33): keep gam.tiagojacinto.eu redirecting for at least 24 months after the cutover. Keep it longer while it still receives more than a few requests a month. The cost is one DNS record and two Caddy blocks, and old links stay in the Gam page on tiagojacinto.eu, in citations, in the README files of other repositories and in anything that was shared. Read the request count in Cloudflare before you remove it.

To remove the host, do these steps in this order.

1. Delete the Cloudflare redirect rule.
2. Delete the two gam blocks from /opt/vps/caddy/Caddyfile. Reload Caddy.
3. Delete the gam rule from /etc/cloudflared/config.yml. Restart cloudflared.
4. Delete the gam DNS record.

The old container stops at step 14 of site/deploy/README.md. The image ghcr.io/tiagojct/gam stays until you delete the package. The weekly rebuild in the old repository changes nothing after that, because no container runs the image.

## 5. Consumers

docs/migration/inventory/consumers.md has the detail. Update them in this order.

| Consumer | Follow-up |
|---|---|
| Loomings (public, deployed from ghcr.io/tiagojct/loomings by watchtower) | Replace src/palettes.js with dist/packages/loomings/palettes.js. The module keeps the old exports and accepts the old keys glauca, tryworks and ambergris, so stored settings still work. The Pequod values change, so run the palette tests. A deployment follows a v* tag. |
| pequod-quarto (public, v0.3.1) | Copy in the corrected Pequod values. Change the links in the README and the homepage. It overlaps the Ensigns Quarto extension (D21). Keep it. |
| pequod-wallpapers (public) | Replace the vendored pequod.json and CSS with the corrected values. Replace the dead project link. |
| subsub (public, npm @tiagojct/subsub) | make-themes.py reads the old key names and fails on the new schema. Freeze it, or change it to read the Ensigns JSON export. Keep the theme ids subsub-glauca and subsub-try-works, because they ship in the npm package. |
| tiagojacinto.eu (private, deployed by its own workflow) | Replace the Gam page with an Ensigns page and a new screenshot. The Gam and Loomings pages both produce the BibTeX key jacinto2026, so give each its own key. The Glauca theme files stay until you switch to Goney. A prefix change reaches every one of them. |
| diagcalc (public, npm diagcalc) | Nothing while it stays frozen. |
| Other copies | Nothing until you re-sync them. Section 6.5 of docs/migration/INVENTORY.md lists them. |

## 6. Citation and DOI

CITATION.cff in this repository names Ensigns 1.0.0 and has no DOI. To get a Zenodo DOI, make the repository public, enable it in the GitHub settings of Zenodo, and publish a GitHub release. Zenodo acts on releases only. Then add the DOI to CITATION.cff and to the README. The CITATION.cff files in the archived repositories stay as they are.

## Open

- The five pequod 0.3.0 releases are not prepared (section 1).
- The decision on the length of the redirect (D33, section 4).
