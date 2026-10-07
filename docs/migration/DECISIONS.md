# Decisions recorded on 2026-10-07

CHECKPOINT-3.md and CHECKPOINT-5.md asked the owner for decisions D2 and D22 to D38. On 2026-10-07 the owner asked to proceed with the recommended option for each one. This file records the outcome. A decision that needs a step that only the owner may take says so.

## Decided, and applied

- D2. Author email. Confirmed. GitHub links the commits made with tiagojacinto@med.up.pt to the account tiagojct. One older commit, made with tiagojct@tiagojct.eu, is not linked.
- D22. Licence text. Approved. LICENSE-CC-BY-4.0 holds the legal code.
- D23. Pequod, Ahab. Route E stays.
- D24. Goney, Imum. The dedicated value stays.
- D25. Colour vision target. The target of 0.06 in OKLab stays, with no floors on the six new families. The migrated families keep their floors until their next release.
- D26. Goney, keyword on the current line. The waiver stays until the next release retunes it.
- D27. APCA. apca-w3 and colorparsley stay as build-time development dependencies, and nothing ships them (rule 8 in CLAUDE.md, tests/shared/licences.test.ts).
- D28. Rosebud, mode labels. Mid-day sea and Grey amber stay.
- D29. Goney, warning colour. The amber stays.
- D30. Rosebud, dark status accents. Done in Rosebud 0.5.0 (families/rosebud/CHANGELOG.md).
- D31. Jeroboam, light-mode flags. The main file stays as the design. The royal-blue candidate is not adopted. Its file stays in families/jeroboam/candidates/ as a record, because this work deletes no file without the owner's word. Delete it if you want it gone.
- D32. Enderby, primary candidate. The separable design stays primary. The balanced design stays as an optional candidate.
- D33. The gam redirect. gam.tiagojacinto.eu redirects for at least 24 months, which is until 2028-10-07. Then decide from the Cloudflare request count (docs/RETIREMENT.md, section 4).
- D34. The build footer. Done in pull request 5. The footer prints the collection version and each family's version. An image also prints its commit and the date of that commit.
- D36. The old /official/ paths. No redirects. Cloudflare analytics for gam.tiagojacinto.eu show 49 requests for paths that contain /official/ in the 30 days to 2026-10-07. All 49 came from one client, curl 8.7.1, in one burst, and none came in the last 24 hours. They look like test requests, not visitors. Look at the count again when the redirect is reviewed (D33).
- D38. The image. The choices stay: linux/amd64 only, base images not pinned to a digest, and a public GHCR package. The package has been public since 2026-10-07. The build-deploy workflow stays the one place where CI publishes.

## Waiting for the owner

- D37. Transport security. Always Use HTTPS and HSTS are Cloudflare security settings, so the owner sets them. Proposal: turn on Always Use HTTPS, and add HSTS after a month without mixed-content problems, which is not before 2026-11-07. Always Use HTTPS is a zone setting, so it reaches every host in tiagojacinto.eu. A redirect rule that matches only the ensigns host is the narrower option.
