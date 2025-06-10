export {};

declare global {
  interface Window {
    gapi: any;
    electron?: {
      setIgnoreMouseEvents: (ignore: boolean) => void;
      googleAuth: () => Promise<any>;
      getEvents: () => Promise<any>;
    };
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }

  /// <reference types="vite/client" />

  interface ImportMetaEnv {
    readonly MAIN_VITE_GOOGLE_CLIENT_ID: string;
    readonly MAIN_VITE_GOOGLE_CLIENT_SECRET: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
