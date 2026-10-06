import type { ModeName, ResolvedFamily } from "../model/types.ts";

export interface ExportOptions {
  mode?: ModeName | "both";
}

export interface ExportFile {
  name: string;
  content: string | Uint8Array;
  mime: string;
}

export interface Generator {
  id: string;
  label: string;
  /** A reason when the family cannot be exported to this target. */
  unavailable: (family: ResolvedFamily, options?: ExportOptions) => string | undefined;
  generate: (family: ResolvedFamily, options?: ExportOptions) => ExportFile[];
}
