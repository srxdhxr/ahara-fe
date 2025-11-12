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
      className="w-full flex items-center justify-center gap-2 h-12 bg-white/50 clay-shadow text-[#8B7355] rounded-[16px] font-semibold hover:bg-white/70 transition-all"
    >
      <LogOut className="w-5 h-5" />
      Logout
    </button>
  );
}

