/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_URL: string
  readonly VITE_API_URL: string
  readonly VITE_SECURE_MODE: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_CACHE_DURATION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}