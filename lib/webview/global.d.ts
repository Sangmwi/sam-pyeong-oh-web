import type { AppToWebMessage } from './types';

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }

  interface WindowEventMap {
    'app-command': CustomEvent<AppToWebMessage>;
  }
}

export {};
