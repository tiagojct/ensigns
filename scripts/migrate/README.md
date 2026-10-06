# Migration scripts

These two scripts turned the four old token formats into the family token files. Both are one-off. They stay because they record how the files were derived.

- export-legacy-model.mjs ran the four gam adapters against the frozen legacy token files and the committed outputs, and wrote the normalised model each one produced to tests/fixtures/legacy/model. That snapshot is the original that the equality tests compare with. The adapters were deleted after the migration passed, so this script cannot run again; the snapshots stay.
- convert.ts reads the snapshots and the legacy token files and writes families/<id>/<id>.tokens.json. A colour with a palette name is referenced by it, and a colour without one gets a new entry, so two roles that shared a hex share one entry. A value may differ from the original only where the script's override table says so; the difference is recorded in tests/shared/expected-changes. Any other difference stops the run.

node scripts/migrate/convert.ts writes the four families with values only. node scripts/migrate/convert.ts --declare also writes the pairs, distinct sets and rule checks. After the migration commit the token files are edited directly and the converter is not run again: it would overwrite the corrections.
