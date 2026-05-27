// PWA install helpers.

// True when the app is already running as an installed PWA (home-screen app),
// so we should never show an install prompt.
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const mm = window.matchMedia?.('(display-mode: standalone)').matches ?? false;
  // iOS Safari exposes navigator.standalone for home-screen apps.
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  return mm || iosStandalone;
}

// True on iOS Safari (iPhone/iPad), including iPadOS 13+ which masquerades as
// macOS but reports touch support. iOS has no beforeinstallprompt, so these
// users must add to home screen manually.
export function isIOS(
  ua: string = typeof navigator !== 'undefined' ? navigator.userAgent : '',
  hasTouch: boolean = typeof document !== 'undefined' && 'ontouchend' in document,
): boolean {
  if (/iphone|ipad|ipod/i.test(ua)) return true;
  return /macintosh/i.test(ua) && hasTouch;
}

// Minimal shape of the (non-standard) beforeinstallprompt event.
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const INSTALL_DISMISSED_KEY = 'mgr-install-dismissed';
