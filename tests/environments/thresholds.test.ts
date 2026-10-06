// tests/environments.json: every threshold has a why, and the implemented
// profiles read only numbers that exist.
import { describe, expect, it } from "vitest";
import { num } from "../../lib/harness/index.ts";
import { thresholds } from "./helpers.ts";

function* thresholdObjects(value: unknown, path: string): Generator<[string, Record<string, unknown>]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return;
  const obj = value as Record<string, unknown>;
  // A threshold holds a plain value (a number, a flag or a list); a group holds other objects.
  const plain = (v: unknown) => typeof v !== "object" || v === null || Array.isArray(v);
  if (["value", "min", "max", "minDistance", "reported"].some((k) => k in obj && plain(obj[k]))) yield [path, obj];
  for (const [k, v] of Object.entries(obj)) yield* thresholdObjects(v, path ? `${path}.${k}` : k);
}

describe("tests/environments.json", () => {
  it("gives every threshold a why", () => {
    const missing: string[] = [];
    let n = 0;
    for (const [path, obj] of thresholdObjects(thresholds, "")) {
      n++;
      if (typeof obj.why !== "string" || obj.why.length < 15) missing.push(path);
    }
    expect(n).toBeGreaterThan(30);
    expect(missing).toEqual([]);
  });

  it("gives every profile a why and a status", () => {
    const profiles = (thresholds as { profiles: Record<string, { why?: string; status?: string }> }).profiles;
    for (const [id, p] of Object.entries(profiles)) {
      expect(p.why?.length ?? 0, `${id} why`).toBeGreaterThan(15);
      expect(p.status, `${id} status`).toBeTruthy();
    }
  });

  it("reads numbers by path and refuses a typo", () => {
    expect(num(thresholds, "common.wcag.text.value")).toBe(4.5);
    expect(() => num(thresholds, "common.wcag.txet.value")).toThrow(/no common.wcag.txet.value/);
    expect(() => num(thresholds, "profiles.night.textHue.why")).toThrow(/not a number/);
  });
});
