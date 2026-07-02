import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import { session } from '../api/auth';
import {
  GOAL_LABELS,
  userApi,
  type Goal,
  type HealthData,
  type Preferences,
  type UserProfile,
} from '../api/user';

// --- small pixel form primitives -------------------------------------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-[3px] border-ink bg-cream p-4 shadow-pixel">
      <h2 className="mb-3 font-pixel text-[10px] tracking-widest text-purple">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-pixel text-[9px] tracking-wider text-brown">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  'mt-1 w-full border-[2px] border-ink bg-white px-3 py-2 font-mono text-sm focus:bg-lavender focus:outline-none';

function SaveButton({ busy, saved, onClick }: { busy: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="pixel-press border-[2px] border-ink bg-purple px-4 py-2 font-pixel text-[10px] tracking-wider text-cream shadow-pixel-sm disabled:opacity-50"
    >
      {busy ? 'SAVING…' : saved ? '✓ SAVED' : 'SAVE'}
    </button>
  );
}

function PillEditor({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim().toLowerCase();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft('');
  };
  return (
    <div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder={placeholder}
          className={inputCls + ' mt-0'}
        />
        <button
          onClick={add}
          disabled={!draft.trim()}
          className="pixel-press shrink-0 border-[2px] border-ink bg-cream px-3 font-pixel text-xs shadow-pixel-sm disabled:opacity-50"
        >
          +
        </button>
      </div>
      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center border-[2px] border-ink bg-lavender px-2 py-1 font-mono text-xs"
            >
              {v}
              <button
                aria-label={`remove ${v}`}
                onClick={() => onChange(values.filter((x) => x !== v))}
                className="ml-1.5 border-l-[2px] border-ink pl-1.5 font-pixel text-xs hover:text-purple-deep"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// --- sections ----------------------------------------------------------------

function useSave<T>(update: (v: T) => Promise<void>) {
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const save = async (value: T) => {
    setBusy(true);
    try {
      await update(value);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } finally {
      setBusy(false);
    }
  };
  return { busy, saved, save };
}

function ProfileSection() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { busy, saved, save } = useSave(userApi.updateProfile);
  useEffect(() => {
    userApi.getProfile().then(setProfile);
  }, []);
  if (!profile) return null;
  return (
    <Section title="PROFILE">
      <Field label="FIRST NAME">
        <input
          className={inputCls}
          value={profile.first_name}
          onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
        />
      </Field>
      <Field label="EMAIL">
        <input
          className={inputCls}
          type="email"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
        />
      </Field>
      <Field label="PHONE">
        <input
          className={inputCls}
          type="tel"
          value={profile.phone_number}
          onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
        />
      </Field>
      <SaveButton busy={busy} saved={saved} onClick={() => save(profile)} />
    </Section>
  );
}

function HealthSection() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const { busy, saved, save } = useSave(userApi.updateHealth);
  useEffect(() => {
    userApi.getHealth().then(setHealth);
  }, []);
  if (!health) return null;

  const num = (v: string) => (v === '' ? null : Number(v));

  return (
    <Section title="HEALTH DATA">
      <Field label="SEX">
        <div className="mt-1 flex gap-2">
          {(['M', 'F'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setHealth({ ...health, sex: s })}
              className={`pixel-press flex-1 border-[2px] border-ink px-4 py-2 font-pixel text-xs shadow-pixel-sm ${
                health.sex === s ? 'bg-purple text-cream' : 'bg-cream text-ink'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </Field>
      <div className="grid grid-cols-3 gap-2">
        <Field label="AGE">
          <input
            className={inputCls}
            type="number"
            min={13}
            max={100}
            value={health.age ?? ''}
            onChange={(e) => setHealth({ ...health, age: num(e.target.value) })}
          />
        </Field>
        <Field label="WEIGHT LB">
          <input
            className={inputCls}
            type="number"
            min={60}
            max={700}
            value={health.weight_lb ?? ''}
            onChange={(e) => setHealth({ ...health, weight_lb: num(e.target.value) })}
          />
        </Field>
        <Field label="HEIGHT IN">
          <input
            className={inputCls}
            type="number"
            min={48}
            max={96}
            value={health.height_in ?? ''}
            onChange={(e) => setHealth({ ...health, height_in: num(e.target.value) })}
          />
        </Field>
      </div>
      <SaveButton busy={busy} saved={saved} onClick={() => save(health)} />
    </Section>
  );
}

function PreferencesSection() {
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const { busy, saved, save } = useSave(userApi.updatePreferences);
  useEffect(() => {
    userApi.getPreferences().then(setPrefs);
  }, []);
  if (!prefs) return null;

  const toggleGoal = (g: Goal) =>
    setPrefs({
      ...prefs,
      goals: prefs.goals.includes(g) ? prefs.goals.filter((x) => x !== g) : [...prefs.goals, g],
    });

  return (
    <Section title="PREFERENCES">
      <Field label="GOALS">
        <div className="mt-1 flex flex-wrap gap-2">
          {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => (
            <button
              key={g}
              onClick={() => toggleGoal(g)}
              aria-pressed={prefs.goals.includes(g)}
              className={`pixel-press border-[2px] border-ink px-3 py-1.5 font-pixel text-[9px] tracking-wider shadow-pixel-sm ${
                prefs.goals.includes(g) ? 'bg-purple text-cream' : 'bg-cream text-ink'
              }`}
            >
              {GOAL_LABELS[g]}
            </button>
          ))}
        </div>
      </Field>
      <Field label="ALLERGIES">
        <PillEditor
          values={prefs.allergies}
          onChange={(allergies) => setPrefs({ ...prefs, allergies })}
          placeholder="add allergy…"
        />
      </Field>
      <Field label="MEDICATIONS">
        <PillEditor
          values={prefs.medications}
          onChange={(medications) => setPrefs({ ...prefs, medications })}
          placeholder="add medication…"
        />
      </Field>
      <SaveButton busy={busy} saved={saved} onClick={() => save(prefs)} />
    </Section>
  );
}

// --- page ---------------------------------------------------------------------

export default function Settings() {
  const navigate = useNavigate();

  const logout = () => {
    session.end();
    navigate('/auth', { replace: true });
  };

  return (
    <div className="dot-grid-faint min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full flex-col bg-cream sm:my-8 sm:min-h-0 sm:max-w-md sm:border-[3px] sm:border-ink sm:shadow-pixel">
        <div className="flex items-center gap-3 border-b-[3px] border-ink bg-lavender px-4 py-2">
          <button
            aria-label="Back to chat"
            onClick={() => navigate('/')}
            className="pixel-press border-[2px] border-ink bg-cream p-1 text-ink shadow-pixel-sm"
          >
            <ArrowLeft size={14} strokeWidth={2.5} />
          </button>
          <span className="font-pixel text-[10px] tracking-widest">SETTINGS</span>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
          <ProfileSection />
          <HealthSection />
          <PreferencesSection />

          <button
            onClick={logout}
            className="pixel-press flex w-full items-center justify-center gap-2 border-[3px] border-ink bg-cream px-4 py-3 font-pixel text-xs tracking-wider text-ink shadow-pixel hover:text-purple-deep"
          >
            <LogOut size={14} strokeWidth={2.5} />
            LOG OUT
          </button>
        </div>
      </div>
    </div>
  );
}
