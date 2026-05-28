/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_SHARE_BASE_URL?: string;
  readonly VITE_USE_MOCK_AUTH?: string;
  readonly VITE_AUTH_ME_URL?: string;
  readonly VITE_AUTH_LOGOUT_URL?: string;
  readonly VITE_KAKAO_LOGIN_URL?: string;
  readonly VITE_GOOGLE_LOGIN_URL?: string;
  readonly VITE_APPLE_LOGIN_URL?: string;
  readonly VITE_FEEDBACK_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
