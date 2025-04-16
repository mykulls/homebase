export {};

declare global {
  interface Window {
    electron?: {
      setIgnoreMouseEvents: (ignore: boolean) => void;
    };
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}
