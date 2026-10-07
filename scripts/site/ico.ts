// An .ico file that holds PNG images. Every current browser reads that form, and so do crawlers
// that ask for /favicon.ico. The site's mark is drawn once, as an SVG, and rendered to each size.

/** The width and height that a PNG file states in its header (IHDR). */
function pngSize(png: Uint8Array): { width: number; height: number } {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (png.length < 24 || signature.some((byte, i) => png[i] !== byte)) throw new Error("An .ico entry must be a PNG file.");
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

/** Pack PNG images, each at most 256 pixels on a side, into one .ico file. */
export function ico(images: Uint8Array[]): Uint8Array {
  const directory = 6 + 16 * images.length;
  const out = new Uint8Array(directory + images.reduce((total, image) => total + image.length, 0));
  const view = new DataView(out.buffer);
  view.setUint16(2, 1, true); // the type: icon
  view.setUint16(4, images.length, true);
  let offset = directory;
  for (const [i, png] of images.entries()) {
    const { width, height } = pngSize(png);
    if (width > 256 || height > 256) throw new Error(`An .ico entry is at most 256 pixels on a side, not ${width} by ${height}.`);
    const entry = 6 + 16 * i;
    out[entry] = width === 256 ? 0 : width; // the format writes 256 as 0
    out[entry + 1] = height === 256 ? 0 : height;
    view.setUint16(entry + 4, 1, true); // colour planes
    view.setUint16(entry + 6, 32, true); // bits per pixel
    view.setUint32(entry + 8, png.length, true);
    view.setUint32(entry + 12, offset, true);
    out.set(png, offset);
    offset += png.length;
  }
  return out;
}
