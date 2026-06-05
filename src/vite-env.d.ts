/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PRESIGN_S3_API_BASE_URL?: string;
  readonly VITE_PRESIGNED_S3_API_TOKEN?: string;
  readonly VITE_MAPBOX_STYLE_TOKEN?: string;
  readonly VITE_MAPBOX_RS_MAP_STYLE?: string;
  readonly VITE_MAPBOX_ACCESS_TOKEN?: string;
}
