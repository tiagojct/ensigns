// The members of a distinct set inside one resolved mode: the colours that
// must be told apart, each with a name that a reinforced pair can use.
import { ANSI_HUES, ANSI_SLOTS, SYNTAX_HUES, SYNTAX_ROLES } from "./types.ts";
import type { Distinct, Resolved, ResolvedMode } from "./types.ts";

export interface SetMember {
  name: string;
  address: string;
  colour: Resolved;
}

function fromNames(mode: ResolvedMode, prefix: string, names: readonly string[]): SetMember[] {
  const out: SetMember[] = [];
  for (const name of names) {
    const address = `${prefix}.${name}`;
    const colour = mode.colours.get(address);
    if (colour) out.push({ name, address, colour });
  }
  return out;
}

/** Members of a distinct declaration in a mode. A missing address is left out; the validator reports it. */
export function distinctMembers(mode: ResolvedMode, d: Distinct): SetMember[] {
  if (d.members) {
    return d.members.flatMap((address) => {
      const colour = mode.colours.get(address);
      return colour ? [{ name: address, address, colour }] : [];
    });
  }
  switch (d.set) {
    case "syntax":
      return fromNames(mode, "syntax", SYNTAX_ROLES);
    case "syntax-hues":
      return fromNames(mode, "syntax", SYNTAX_HUES);
    case "accents": {
      const prefix = "accents.";
      const out: SetMember[] = [];
      for (const [address, colour] of mode.colours) {
        if (address.startsWith(prefix)) out.push({ name: address.slice(prefix.length), address, colour });
      }
      return out;
    }
    case "ansi":
      return fromNames(mode, "ansi", ANSI_SLOTS);
    case "ansi-hues":
      return fromNames(mode, "ansi", ANSI_HUES);
    case "status": {
      const prefix = "status.";
      const out: SetMember[] = [];
      for (const [address, colour] of mode.colours) {
        if (address.startsWith(prefix) && address.split(".").length === 2) {
          out.push({ name: address.slice(prefix.length), address, colour });
        }
      }
      return out;
    }
    case "data.categorical": {
      const prefix = "data.categorical.";
      const out: SetMember[] = [];
      for (const [address, colour] of mode.colours) {
        if (address.startsWith(prefix)) out.push({ name: address.slice(prefix.length), address, colour });
      }
      return out;
    }
    default:
      return [];
  }
}
