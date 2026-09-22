/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_RENT_HISTORY_REQUEST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
