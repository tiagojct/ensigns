// Three families kept a name from the old repositories under a new one. Old links
// and saved settings still carry the old ids, so the build and the site map them.
// Pure data, so it also runs in the browser.
export const RENAMED_FAMILIES: Readonly<Record<string, string>> = {
  glauca: "goney",
  "try-works": "jungfrau",
  ambergris: "rosebud",
};

/** The current id for an id that may be an old one. Any other string comes back as it was. */
export const currentFamilyId = (id: string): string => (Object.hasOwn(RENAMED_FAMILIES, id) ? RENAMED_FAMILIES[id]! : id);
