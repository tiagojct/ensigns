// The icons that browsers and crawlers ask for without being told: favicon.ico and the iOS touch icon.
import { Resvg } from "@resvg/resvg-js";
import { describe, expect, it } from "vitest";
import { ico } from "../../scripts/site/ico.ts";

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const png = (size: number) =>
  new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="#123456"/></svg>`, {
    fitTo: { mode: "width", value: size },
  })
    .render()
    .asPng();

describe("ico", () => {
  it("puts PNG images behind a directory that states each size, its length and where it starts", () => {
    const sizes = [16, 32, 48];
    const images = sizes.map(png);
    const file = ico(images);
    const view = new DataView(file.buffer, file.byteOffset, file.byteLength);
    expect([view.getUint16(0, true), view.getUint16(2, true), view.getUint16(4, true)]).toEqual([0, 1, 3]);
    let next = 6 + 16 * sizes.length;
    for (const [i, size] of sizes.entries()) {
      const entry = 6 + 16 * i;
      expect([file[entry], file[entry + 1]], `entry ${i}`).toEqual([size, size]);
      expect(view.getUint32(entry + 8, true), `length ${i}`).toBe(images[i]!.length);
      expect(view.getUint32(entry + 12, true), `offset ${i}`).toBe(next);
      expect([...file.slice(next, next + 8)], `signature ${i}`).toEqual(SIGNATURE);
      next += images[i]!.length;
    }
    expect(next).toBe(file.length);
  });

  it("writes 256 as 0, as the format wants, and refuses a larger image", () => {
    expect(ico([png(256)])[6]).toBe(0);
    expect(() => ico([png(257)])).toThrow("256");
  });

  it("refuses a file that is not a PNG", () => {
    expect(() => ico([new Uint8Array(40)])).toThrow("PNG");
  });
});
