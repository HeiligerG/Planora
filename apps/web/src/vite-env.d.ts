/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
  readonly VITE_API_URL?: string
  // Weitere ENV-Variablen hier hinzufügen
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}