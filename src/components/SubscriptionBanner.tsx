import { useState } from 'react';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { billingApi, type Me } from '../api/user';

/**
 * Slim subscription strip under the chat header.
 *  - active trial → days-left countdown + MANAGE (Stripe portal)
 *  - free/cancelled → SUBSCRIBE (Stripe checkout, pay-today)
 *  - paid, or grandfathered trial with no future end date → renders nothing
 */
export default function SubscriptionBanner({ me }: { me: Me | undefined }) {
  // busy until the redirect actually happens — double-taps would otherwise
  // mint extra Stripe portal/checkout sessions
  const [busy, setBusy] = useState(false);

  if (!me) return null;

  const go = (fn: () => Promise<string>) => () => {
    if (busy) return;
    setBusy(true);
    fn()
      .then((url) => window.location.assign(url))
      .catch(() => {
        // portal/checkout hiccup — send them somewhere useful, never dead-end
        window.location.assign('https://www.withahara.com/start');
      });
  };

  if (me.status === 'trial' && me.trial_ends_at) {
    const daysLeft = differenceInCalendarDays(parseISO(me.trial_ends_at), new Date());
    if (daysLeft >= 0) {
      return (
        <div className="flex items-center justify-between border-b-[3px] border-ink bg-cream px-3 py-1.5">
          <span className="font-pixel text-[9px] tracking-wider text-purple">
            FREE TRIAL · {daysLeft === 0 ? 'LAST DAY' : `${daysLeft} DAY${daysLeft === 1 ? '' : 'S'} LEFT`}
          </span>
          <button
            onClick={go(billingApi.portal)}
            disabled={busy}
            className="pixel-press border-[2px] border-ink bg-cream px-2 py-0.5 font-pixel text-[9px] tracking-wider text-ink shadow-pixel-sm disabled:opacity-50"
          >
            {busy ? 'OPENING…' : 'MANAGE'}
          </button>
        </div>
      );
    }
  }

  if (me.status === 'free' || me.status === 'cancelled') {
    return (
      <div className="flex items-center justify-between border-b-[3px] border-ink bg-purple px-3 py-1.5">
        <span className="font-pixel text-[9px] tracking-wider text-cream">
          SUBSCRIPTION INACTIVE
        </span>
        <button
          onClick={go(billingApi.checkout)}
          disabled={busy}
          className="pixel-press border-[2px] border-ink bg-cream px-2 py-0.5 font-pixel text-[9px] tracking-wider text-ink shadow-pixel-sm disabled:opacity-50"
        >
          {busy ? 'OPENING…' : '▶ SUBSCRIBE · $13.99/MO'}
        </button>
      </div>
    );
  }

  return null; // paid, or legacy trial with no live countdown
}
