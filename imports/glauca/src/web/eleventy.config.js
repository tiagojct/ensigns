export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  // subset_fonts.sh writes the woff2 subsets to public/fonts; publish them at /fonts/.
  eleventyConfig.addPassthroughCopy({ "public/fonts": "fonts" });
  return {
    dir: { input: "src", output: "_site", includes: "_includes" },
  };
}
