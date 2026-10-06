// Types and constants for a family token file. They mirror
// schema/family.schema.json; the schema is the contract, these are the
// convenience. Pure: nothing here touches the file system.

export const MODES = ["dark", "light"] as const;
export type ModeName = (typeof MODES)[number];

/** The fifteen core roles every family defines in both modes. */
export const CORE_ROLES = [
  "bg",
  "surface",
  "surface-raised",
  "text",
  "text-muted",
  "text-subtle",
  "border",
  "link",
  "link-hover",
  "accent",
  "on-accent",
  "button",
  "on-button",
  "focus",
  "selection",
] as const;
export type CoreRole = (typeof CORE_ROLES)[number];

export const SYNTAX_ROLES = [
  "keyword",
  "string",
  "number",
  "comment",
  "function",
  "type",
  "constant",
  "variable",
  "operator",
  "punctuation",
  "decorator",
  "parameter",
] as const;
export type SyntaxRole = (typeof SYNTAX_ROLES)[number];

export const ANSI_SLOTS = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
  "bright-black",
  "bright-red",
  "bright-green",
  "bright-yellow",
  "bright-blue",
  "bright-magenta",
  "bright-cyan",
  "bright-white",
] as const;
export type AnsiSlot = (typeof ANSI_SLOTS)[number];

/** The syntax roles whose hue carries meaning. The others are told apart by lightness and style. */
export const SYNTAX_HUES = ["keyword", "string", "number", "function", "type", "constant", "decorator"] as const;

/** The six hue slots of the eight normal ANSI colours (black and white are neutrals). */
export const ANSI_HUES = ["red", "green", "yellow", "blue", "magenta", "cyan"] as const;

export const TERMINAL_KEYS = [
  "background",
  "foreground",
  "cursor",
  "cursor-text",
  "selection-background",
  "selection-foreground",
] as const;

export const ENVIRONMENTS = [
  "office-screen",
  "editor",
  "night",
  "projector",
  "sunlight",
  "aged-eye",
  "print-grey",
  "eink",
  "photocopy",
  "forced-colors",
  "overlay",
  "clinical",
  "figure",
  "cvd",
] as const;
export type Environment = (typeof ENVIRONMENTS)[number];

export type Hex = string;
export type PaletteRef = string;
export type Address = string;

export type PaletteColour =
  | Hex
  | { hex: Hex; p3?: [number, number, number]; cmyk?: [number, number, number, number]; note?: string }
  | { ref: PaletteRef; alpha: number; note?: string };

export type Palette = Record<string, Record<string, PaletteColour>>;

export type Style = "italic" | "bold" | "bold italic" | "underline" | "strikethrough";
export type Styled = PaletteRef | { color: PaletteRef; style?: Style };

export type Surface = PaletteRef | { ref: PaletteRef; alpha: number; over: Address };

export interface Meta {
  id: string;
  name: string;
  host?: boolean;
  formerly?: { id: string; name: string; version: string };
  version: string;
  chapter?: number | [number, number];
  chapterTitle?: string;
  quote?: string;
  quotes?: { chapter?: number | string; text: string }[];
  tagline?: string;
  goal: string;
  environments: Environment[];
  licence: { tokens: "CC-BY-4.0"; code: "MIT" };
}

export type Roles = Record<CoreRole, PaletteRef> & { extra?: Record<string, PaletteRef> };

export interface AchromaticLevel {
  weight: string;
  edge: "solid" | "dashed" | "dotted" | "double";
  fill: PaletteRef;
  accent: PaletteRef;
  icon: string;
}

export type Status =
  | {
      policy: "chromatic";
      danger: PaletteRef;
      warning: PaletteRef;
      success: PaletteRef;
      info: PaletteRef;
      hint?: PaletteRef;
      conflict?: PaletteRef;
    }
  | {
      policy: "achromatic";
      neutral: AchromaticLevel;
      success: AchromaticLevel;
      warning: AchromaticLevel;
      critical: AchromaticLevel;
    };

export interface ColourScale {
  label?: string;
  colors: PaletteRef[];
}

export type Data =
  | { ref: string }
  | {
      categorical?: { label?: string; colors: Record<string, PaletteRef> };
      sequential?: Record<string, ColourScale>;
      diverging?: Record<string, ColourScale>;
      plot?: Record<string, PaletteRef>;
    };

export interface ModeFile {
  label?: string;
  roles: Roles;
  accents?: Record<string, PaletteRef>;
  surfaces?: Record<string, Surface>;
  syntax?: Record<SyntaxRole, Styled>;
  ansi?: Record<AnsiSlot, PaletteRef>;
  terminal?: Record<(typeof TERMINAL_KEYS)[number], PaletteRef>;
  status?: Status;
  data?: Data;
}

export interface Pair {
  fg: Address;
  bg: Address;
  kind: "text" | "large" | "component";
  min?: number;
  modes?: ModeName[];
  why?: string;
}

export interface Rule {
  id: string;
  text: string;
  check?: string | string[];
}

export interface Distinct {
  id: string;
  set?: "syntax" | "syntax-hues" | "accents" | "ansi-hues" | "ansi" | "status" | "data.categorical";
  members?: Address[];
  modes?: ModeName[];
  min?: number;
  cvd?: "gate" | "report";
  reinforced?: [string, string][];
  aliases?: [string, string][];
  by?: string;
  note?: string;
}

export interface Exception {
  profile: Environment;
  id: string;
  mode?: ModeName;
  why: string;
}

export interface FamilyFile {
  $schema?: string;
  meta: Meta;
  palette: Palette;
  modes: Record<ModeName, ModeFile>;
  typography?: Record<string, string>;
  design?: Record<string, unknown>;
  pairs?: Pair[];
  rules?: Rule[];
  distinct?: Distinct[];
  exceptions?: Exception[];
  derived?: ("syntax" | "ansi" | "terminal" | "status" | "data")[];
  targets?: { exclude?: string[] };
}

/** A colour after every reference is followed. `alpha` is set only for translucent entries. */
export interface Resolved {
  hex: Hex;
  alpha?: number;
  /** The palette entry it came from, as group.name, or a description for a composed surface. */
  from: string;
  style?: Style;
}

export interface ResolvedMode {
  label?: string;
  /** Every colour in the mode by address, in file order. */
  colours: Map<Address, Resolved>;
  /** Set when the mode's data is a reference to another family's (data.ref). */
  dataRef?: string;
}

export interface ResolvedFamily {
  meta: Meta;
  /** Palette entries by group.name. */
  palette: Map<string, Resolved>;
  modes: Record<ModeName, ResolvedMode>;
  source: FamilyFile;
}
