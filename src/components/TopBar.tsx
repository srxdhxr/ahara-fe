import { Settings, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopBar({
  title = 'MAYA · AHARA',
  back = false,
  gear = false,
}: {
  title?: string;
  back?: boolean;
  gear?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-11 items-center justify-between px-4 py-2">
      <div className="flex items-center gap-3">
        {back && (
          <button
            aria-label="Back to chat"
            onClick={() => navigate('/')}
            className="pixel-press border-[2px] border-ink bg-cream p-1.5 text-ink shadow-pixel-sm"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
          </button>
        )}
        <span className="font-pixel text-[10px] tracking-widest">{title}</span>
      </div>
      {gear && (
        <button
          aria-label="Settings"
          onClick={() => navigate('/settings')}
          className="pixel-press border-[2px] border-ink bg-cream p-1.5 text-ink shadow-pixel-sm focus:outline-none focus-visible:bg-lavender"
        >
          <Settings size={16} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
