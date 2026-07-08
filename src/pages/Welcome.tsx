import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi, session } from '../api/auth';

/**
 * Stripe checkout success lands here: /welcome?sid=cs_live_…
 * The sid is exchanged server-side (validated against Stripe) for a JWT —
 * the user walks from the card page straight into their chat with Maya.
 */
export default function Welcome() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [failed, setFailed] = useState(false);
  const ran = useRef(false); // StrictMode double-mount guard

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const sid = params.get('sid');
    if (!sid) {
      navigate(session.isAuthed() ? '/' : '/auth', { replace: true });
      return;
    }
    authApi
      .sessionLogin(sid)
      .then(({ access_token }) => {
        session.start(access_token);
        navigate('/', { replace: true });
      })
      .catch(() => setFailed(true));
  }, [params, navigate]);

  return (
    <div className="flex h-dvh flex-col items-center justify-center bg-cream px-6 text-center">
      {!failed ? (
        <>
          <div className="font-pixel text-xl text-purple">SETTING UP YOUR CHAT…</div>
          <p className="mt-3 font-mono text-sm text-ink/70">payment confirmed — one sec</p>
        </>
      ) : (
        <>
          <div className="font-pixel text-xl text-ink">ALMOST THERE</div>
          <p className="mt-3 max-w-xs font-mono text-sm text-ink/70">
            payment went through, but this sign-in link has gone stale.
            log in with your email — everything's waiting.
          </p>
          <button
            onClick={() => navigate('/auth', { replace: true })}
            className="pixel-press mt-6 border-[3px] border-ink bg-purple px-4 py-3 font-pixel text-sm text-cream shadow-pixel"
          >
            ▶ LOG IN
          </button>
        </>
      )}
    </div>
  );
}
