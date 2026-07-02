import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, session } from '../api/auth';

type Step = 'email' | 'code' | 'apply';

export default function Auth() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestCode = async () => {
    setBusy(true);
    setError(null);
    try {
      const { registered } = await authApi.requestOtp(email.trim().toLowerCase());
      setStep(registered ? 'code' : 'apply');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setError(null);
    try {
      const { access_token } = await authApi.verifyOtp(email.trim().toLowerCase(), code.trim());
      session.start(access_token);
      navigate('/', { replace: true });
    } catch (e) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      setError(status === 401 ? 'invalid or expired code' : 'something went wrong — try again');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dot-grid-faint flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm border-[3px] border-ink bg-cream shadow-pixel">
        <div className="border-b-[3px] border-ink bg-lavender px-4 py-2 text-center">
          <span className="font-pixel text-[10px] tracking-widest">MAYA · AHARA</span>
        </div>

        <div className="space-y-4 px-5 py-6">
          <h1 className="font-pixel text-sm tracking-wider">
            {step === 'email' ? 'SIGN IN' : step === 'code' ? 'CHECK YOUR EMAIL' : 'NOT YET'}
          </h1>

          {step === 'apply' ? (
            <>
              <p className="font-mono text-xs text-brown">
                <span className="text-ink">{email}</span> doesn't have an ahara account yet —
                maya's invite-only right now
              </p>
              <a
                href="https://www.withahara.com/start"
                className="pixel-press block w-full border-[3px] border-ink bg-purple px-4 py-3 text-center font-pixel text-xs tracking-wider text-cream shadow-pixel"
              >
                ▶ APPLY AT WITHAHARA.COM
              </a>
              <button
                onClick={() => {
                  setStep('email');
                  setError(null);
                }}
                className="w-full text-center font-mono text-xs text-brown underline hover:text-purple-deep"
              >
                use a different email
              </button>
            </>
          ) : step === 'email' ? (
            <>
              <p className="font-mono text-xs text-brown">
                enter the email you <span className="text-ink">signed up to ahara with</span> —
                we'll send a 6-digit code
              </p>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && email.trim() && requestCode()}
                placeholder="you@example.com"
                aria-label="Email"
                className="w-full border-[3px] border-ink bg-white px-3 py-2 font-mono text-sm focus:bg-lavender focus:outline-none"
              />
              <button
                onClick={requestCode}
                disabled={busy || !email.trim()}
                className="pixel-press w-full border-[3px] border-ink bg-purple px-4 py-3 font-pixel text-xs tracking-wider text-cream shadow-pixel disabled:opacity-50"
              >
                {busy ? 'SENDING…' : '▶ SEND CODE'}
              </button>
            </>
          ) : (
            <>
              <p className="font-mono text-xs text-brown">
                code sent to <span className="text-ink">{email}</span> — check spam if it's not
                there in a minute
              </p>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && code.length === 6 && verify()}
                placeholder="000000"
                aria-label="6-digit code"
                className="w-full border-[3px] border-ink bg-white px-3 py-2 text-center font-mono text-lg tracking-[0.5em] focus:bg-lavender focus:outline-none"
              />
              <button
                onClick={verify}
                disabled={busy || code.length !== 6}
                className="pixel-press w-full border-[3px] border-ink bg-purple px-4 py-3 font-pixel text-xs tracking-wider text-cream shadow-pixel disabled:opacity-50"
              >
                {busy ? 'VERIFYING…' : '▶ VERIFY'}
              </button>
              <button
                onClick={() => {
                  setStep('email');
                  setCode('');
                  setError(null);
                }}
                className="w-full text-center font-mono text-xs text-brown underline hover:text-purple-deep"
              >
                use a different email
              </button>
            </>
          )}

          {error && (
            <p role="alert" className="font-mono text-xs text-purple-deep">
              ✕ {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
