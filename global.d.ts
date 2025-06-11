export {};

declare global {
  namespace Spotify {
    interface Player {
      connect(): Promise<boolean>;
      disconnect(): void;
      addListener(event: string, callback: (state: any) => void): void;
      removeListener(event: string): void;
      getCurrentState(): Promise<any>;
      setVolume(volume: number): Promise<void>;
      pause(): Promise<void>;
      resume(): Promise<void>;
      togglePlay(): Promise<void>;
      seek(position_ms: number): Promise<void>;
      previousTrack(): Promise<void>;
      nextTrack(): Promise<void>;
    }

    interface PlayerConstructorOptions {
      name: string;
      getOAuthToken(cb: (token: string) => void): void;
      volume?: number;
    }

    interface PlayerInit {
      new (options: PlayerConstructorOptions): Player;
    }
  }

  interface Window {
    gapi: any;
    electron?: {
      setIgnoreMouseEvents: (ignore: boolean) => void;
      onSpotifyCallback: (callback: (data: { code: string; state: string }) => void) => void;
      openExternal: (url: string) => void;
    };
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
    Spotify: {
      Player: new (options: Spotify.PlayerConstructorOptions) => Spotify.Player;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
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
