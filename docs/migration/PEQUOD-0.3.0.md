# Pequod 0.3.0

This file records the state of the last pequod release on 2026-10-07, and what is left for the owner. The owner's guide that came with the patches is in a temporary folder, so the steps that still matter are here.

## Done

- The five patches are applied to github.com/tiagojct/pequod, on top of the archive notice. The annotated tag v0.3.0 is pushed.
- The GitHub release v0.3.0 holds the five packages and SHA256SUMS: https://github.com/tiagojct/pequod/releases/tag/v0.3.0.
- The Visual Studio Marketplace listing Pequod Palette is at 0.3.0, and its project link is https://ensigns.tiagojacinto.eu/pequod/. The upload was made on the publisher page, because no token was available.
- pequod was unarchived for this work and is still open. Its README says that the repository is archived. Archive it again when the uploads below are done.

## Checked before the tag

- Python: 22 tests pass. Tailwind: 6 tests pass. R: 22 expectations pass. scripts/cvd_check.py exits 0.
- The wheel, the sdist and the npm tarball are byte-identical to the builds in the owner's guide. The R tarball and the VS Code package contain time stamps, so their hashes differ and their contents are equal.
- R CMD check --as-cran, with the URL checks on, gives 0 errors, 0 warnings and 1 NOTE. The NOTE is HTML Tidy, because the tidy on the build machine is old. The CRAN incoming check passes now that the site and the repository are live.

## Left for the owner

PyPI, npm, Open VSX and CRAN need your credentials, so they are not done. Do the steps in this order.

1. Download the files and check them.

   ```sh
   gh release download v0.3.0 -R tiagojct/pequod -D ~/pequod-0.3.0
   cd ~/pequod-0.3.0 && shasum -a 256 -c SHA256SUMS
   ```

2. Upload to PyPI with an API token. PyPI refuses a file name that it has seen. If an upload fails halfway, read the project page before you try again.

   ```sh
   python -m pip install twine
   python -m twine upload pequod-0.3.0-py3-none-any.whl pequod-0.3.0.tar.gz
   ```

3. Publish to npm. Use an account with a one-time password.

   ```sh
   npm login
   npm publish pequod-tailwind-0.3.0.tgz
   ```

4. Publish to Open VSX with a token.

   ```sh
   npx --yes ovsx publish pequod-color-theme-0.3.0.vsix -p "$OVSX_PAT"
   ```

5. Submit to CRAN. Open https://cran.r-project.org/submit.html. Upload pequod_0.3.0.tar.gz. Paste the section "CRAN submission" of r/cran-comments.md, from the pequod repository, into the comments field. Submit, then confirm with the link in the email from CRAN.

Check each step after it.

```sh
curl -s https://pypi.org/pypi/pequod/json | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['info']['version'], d['info']['project_urls']['Homepage'])"
npm view pequod-tailwind version homepage
curl -s https://open-vsx.org/api/tiagojct/pequod-color-theme | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['version'], d['homepage'])"
Rscript -e 'available.packages(repos = "https://cloud.r-project.org")["pequod", "Version"]'
```

Each command must print 0.3.0, and the first three must also print the Ensigns link. CRAN can take days, and the mirrors take a day more. If CRAN asks for a change, make it in a new commit. Do not move the tag.

## After the uploads

1. When @tiagojct/ensigns is on npm, run npm deprecate pequod-tailwind "Replaced by @tiagojct/ensigns. See https://ensigns.tiagojacinto.eu".
2. Name tiagojct.ensigns in the Deprecated extensions discussion of the Marketplace. Check the current process first.
3. Archive the repository again: gh repo archive tiagojct/pequod --yes.
