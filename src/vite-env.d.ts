/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Google Maps JavaScript API key; empty = OpenStreetMap fallback. */
  readonly VITE_GOOGLE_MAPS_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
