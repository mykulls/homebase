export {};

declare global {
  interface Window {
    electron?: {
      setIgnoreMouseEvents: (ignore: boolean) => void;
      onSpotifyCallback: (callback: (data: { code: string; state: string }) => void) => void;
      openExternal: (url: string) => void;
    };
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }

  /// <reference types="vite/client" />

  interface ImportMetaEnv {
    readonly VITE_ICS_URL: string;
    readonly VITE_SPOTIFY_CLIENT_ID: string;
    readonly VITE_SPOTIFY_CLIENT_SECRET: string;
    readonly VITE_SPOTIFY_REDIRECT_URI: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
