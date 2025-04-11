export {};

declare global {
  interface Window {
    electron?: {
      setIgnoreMouseEvents: (ignore: boolean) => void;
    };
  }
}
