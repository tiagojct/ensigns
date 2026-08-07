.DEFAULT_GOAL := help

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*?## "}{printf "  %-12s %s\n", $$1, $$2}'

generate: ## Regenerate every surface from src/glauca.json into dist/
	python3 src/scripts/generate.py
	sh src/scripts/assemble.sh

css: generate ## Alias for generate

tailwind: generate ## Alias for generate

dist: generate ## Alias for generate (dist/ is the build output)

demo: ## Compile the Typst demo deck (needs typst + the three fonts)
	typst compile src/typst/demo.typ demo.pdf

clean: ## Remove transient build artefacts (keeps committed dist/)
	rm -rf src/web/_site demo.pdf

.PHONY: help generate css tailwind dist demo clean

cvd: ## Run the colour-vision-deficiency check
	python3 src/scripts/cvd_check.py
.PHONY: cvd

validate: ## Validate tokens, hex, mode parity, and WCAG contrast
	python3 src/scripts/validate.py

check: ## Verify generated files match the json (the CI drift gate)
	python3 src/scripts/generate.py --check

test: validate check ## Run validation and the drift check
all: generate ## Regenerate every surface
.PHONY: validate check test all

fonts-check: ## Verify Portuguese coverage and subset range (needs fonts present)
	python3 src/scripts/check_fonts.py
.PHONY: fonts-check

fonts: ## Subset fonts to woff2 (needs source TTFs in src/fonts/ and brotli)
	sh src/scripts/subset_fonts.sh
.PHONY: fonts

pptx: ## Build the PowerPoint templates into dist/pptx/ (needs python-pptx)
	python3 src/pptx/build_pptx.py
.PHONY: pptx

markedit: ## Bundle the MarkEdit theme into dist/markedit/glauca.js (needs npm)
	cd src/markedit && npm install && npm run build
.PHONY: markedit

firefox-lint: ## Validate the Firefox theme with web-ext (needs npx)
	npx --yes web-ext@8 lint --source-dir dist/firefox --self-hosted
.PHONY: firefox-lint

# Release Firefox enforces add-on signing and ignores xpinstall.signatures.required,
# so the only way to install the theme permanently is a signed package. "unlisted"
# signs it for self-distribution without publishing it on addons.mozilla.org. Get a
# JWT issuer and secret from https://addons.mozilla.org/developers/addon/api/key/ and
# export them first:
#   export AMO_JWT_ISSUER=user:12345:67  AMO_JWT_SECRET=...
# The signed .xpi lands in dist/firefox/; install it from about:addons.
# Thunderbird signs through addons.thunderbird.net instead, which web-ext cannot
# drive -- upload dist/thunderbird/Glauca.xpi there by hand.
firefox-sign: firefox-lint ## Sign the Firefox theme for self-distribution (needs AMO_JWT_* and npx)
	@test -n "$(AMO_JWT_ISSUER)" || { echo "set AMO_JWT_ISSUER and AMO_JWT_SECRET first (see the Makefile comment)"; exit 1; }
	npx --yes web-ext@8 sign --source-dir dist/firefox --artifacts-dir dist/firefox \
		--channel unlisted --api-key "$(AMO_JWT_ISSUER)" --api-secret "$(AMO_JWT_SECRET)"
.PHONY: firefox-sign
