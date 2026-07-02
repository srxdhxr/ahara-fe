import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const DISMISS_KEY = 'pwa_prompt_dismissed_v1';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY)) return;

    // Android / desktop Chrome: capture the native prompt
    const onBip = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onBip);

    // iOS never fires beforeinstallprompt — show manual instructions
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isIos()) {
      timer = setTimeout(() => setVisible(true), 1500);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBip);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    localStorage.setItem(DISMISS_KEY, '1');
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Install app"
      onClick={dismiss}
    >
      <div
        className="w-full max-w-sm border-[3px] border-ink bg-cream shadow-pixel-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-[3px] border-ink bg-lavender px-4 py-2">
          <span className="font-pixel text-[10px] tracking-widest">ADD MAYA TO HOME</span>
          <button
            aria-label="Dismiss"
            onClick={dismiss}
            className="pixel-press border-[2px] border-ink bg-cream p-0.5 shadow-pixel-sm"
          >
            <X size={12} strokeWidth={3} />
          </button>
        </div>

        <div className="space-y-3 px-4 py-4">
          <p className="font-mono text-xs text-brown">
            install maya as an app — opens full screen, one tap from your home screen
          </p>

          {installEvent ? (
            <button
              onClick={install}
              className="pixel-press w-full border-[3px] border-ink bg-purple px-4 py-3 font-pixel text-xs tracking-wider text-cream shadow-pixel"
            >
              ▶ INSTALL
            </button>
          ) : (
            <ol className="space-y-1.5 font-mono text-xs text-ink">
              <li>
                1. tap <span className="border-[2px] border-ink bg-white px-1.5 py-0.5">share ↑</span> in
                safari
              </li>
              <li>
                2. tap{' '}
                <span className="border-[2px] border-ink bg-white px-1.5 py-0.5">
                  add to home screen +
                </span>
              </li>
            </ol>
          )}

          <button
            onClick={dismiss}
            className="w-full text-center font-mono text-xs text-brown underline hover:text-purple-deep"
          >
            maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
