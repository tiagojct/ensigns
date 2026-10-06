# legacy

The sources of the five repositories that Ensigns replaces, kept as the migration record after the current generators were completed. Nothing here is part of the build, and nothing here is edited.

- gam: the old deploy workflow and the two licence files. The retired site source, scripts and executable tests are archived here under site-src/, site-scripts/ and site-tests/. site/ is now the current Ensigns product; its old fixture and snapshot data remain frozen.
- pequod: the R, Python, Tailwind and VS Code packages that produced the published pequod 0.2.0, the Typst specimen, the design script and the examples. They stay to build the last pequod 0.3.0 release on CRAN, PyPI, npm, the VS Code Marketplace and Open VSX, after which Pequod is frozen. Their data files still need regenerating from the corrected tokens.
- glauca: the Python generators and every scaffold file behind Goney's outputs, the old documents and the licences. The generated outputs are the golden fixtures in tests/parity/goney.
- try-works: the same for Jungfrau. The generated outputs are in tests/parity/jungfrau.
- ambergris: the Node generator and its specimen source. The generated outputs are in tests/parity/rosebud.

The old token files are in tests/fixtures/legacy, and the model the old site built from them is in tests/fixtures/legacy/model. Each folder's history continues the original repository's history: git log --follow works on every moved file.

The active build imports nothing from these folders. Current outputs preserve authored values, recorded corrections and target exclusions rather than reproducing retired adapter assumptions.
