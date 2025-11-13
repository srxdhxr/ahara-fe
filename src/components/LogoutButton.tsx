import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    api.logout();
    navigate('/auth');
  };

  return (
    <button
      onClick={handleLogout}
      className="flex flex-col items-center justify-center gap-1 px-3 py-2 bg-white/50 clay-shadow text-[#8B7355] rounded-[12px] hover:bg-white/70 transition-all flex-shrink-0"
    >
      <LogOut className="w-4 h-4" />
      <span className="text-[10px] font-semibold">Logout</span>
    </button>
  );
}

