import { useEffect, useState } from 'react';
import {
  type BeforeInstallPromptEvent,
  INSTALL_DISMISSED_KEY,
  isIOS,
  isStandalone,
} from '../lib/pwa';

// Small iOS Safari "Share" glyph so the instruction is unambiguous.
function ShareIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
         className="inline-block align-[-2px] mx-0.5">
      <path d="M12 3v12" />
      <path d="m8 7 4-4 4 4" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}

// Dismissible top banner prompting installation of the PWA.
//  - Android/desktop Chrome: captures beforeinstallprompt → one-tap Install.
//  - iOS Safari: shows Share → Add to Home Screen instructions (no API there).
//  - Hidden when already installed (standalone) or previously dismissed.
export function InstallBanner() {
  const [dismissed, setDismissed] = useState(
    () => typeof localStorage !== 'undefined' && localStorage.getItem(INSTALL_DISMISSED_KEY) === '1',
  );
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => isStandalone());

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault(); // stop Chrome's mini-infobar; we drive it from the button
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed || dismissed) return null;

  const ios = isIOS();
  // On non-iOS without a captured prompt there's nothing actionable to show.
  if (!ios && !deferred) return null;

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(INSTALL_DISMISSED_KEY, '1'); } catch { /* ignore */ }
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    if (outcome === 'accepted') setInstalled(true);
  };

  return (
    <div className="flex items-center gap-3 mb-3 px-3 py-2.5 rounded-xl bg-[var(--panel)] border border-[var(--accent)]/40 text-[13px]">
      <div className="flex-1 text-[var(--text)]">
        {deferred ? (
          <span>Install the dashboard as an app for quick access.</span>
        ) : (
          <span className="text-[var(--text-muted)]">
            Install this app: tap <ShareIcon /><b className="text-[var(--text)]">Share</b>, then
            {' '}<b className="text-[var(--text)]">Add to Home Screen</b>.
          </span>
        )}
      </div>
      {deferred && (
        <button
          onClick={install}
          className="shrink-0 px-3 py-1 rounded-lg bg-[var(--accent)] text-[#0d1117] font-semibold text-[12px]"
        >
          Install
        </button>
      )}
      <button
        onClick={dismiss}
        aria-label="Dismiss install prompt"
        className="shrink-0 w-6 h-6 grid place-items-center rounded-md text-[var(--text-muted)] hover:text-[var(--text)]"
      >
        ✕
      </button>
    </div>
  );
}
