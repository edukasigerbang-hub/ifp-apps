/// <reference types="vite/client" />

declare module "*.css";

interface ImportMetaEnv {
  readonly VITE_SYNC_BASE_URL?: string;
  readonly VITE_SYNC_TOKEN?: string;
}
