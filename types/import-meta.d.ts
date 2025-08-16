/// <reference types="vitest" />

// Extend ImportMeta to include Vite/Vitest glob functionality
declare interface ImportMeta {
  glob: <T = any>(
    pattern: string,
    options?: {
      eager?: boolean;
      import?: string;
      as?: string;
    },
  ) => T;
}
