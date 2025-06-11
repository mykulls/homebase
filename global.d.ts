export {};

declare global {
  interface Window {
    gapi: any;
    electron?: {
      setIgnoreMouseEvents: (ignore: boolean) => void;
    };
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }

  /// <reference types="vite/client" />

  interface ImportMetaEnv {
    readonly VITE_ICS_URL: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
