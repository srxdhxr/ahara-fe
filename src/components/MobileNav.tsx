import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "../utils";
import { MessageCircle, ScrollText, Plus, TrendingUp, User } from "lucide-react";

export default function MobileNav() {
  const location = useLocation();

  const navItems = [
    { name: "Chat", path: "Chat", icon: MessageCircle },
    { name: "Food Logs", path: "FoodLogs", icon: ScrollText },
    { name: "Log Meal", path: "LogMeal", icon: Plus },
    { name: "Insights", path: "Insights", icon: TrendingUp },
    { name: "Profile", path: "Profile", icon: User }
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-white/40 backdrop-blur-xl rounded-[20px] clay-shadow border border-white/60 px-2 py-2 z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === createPageUrl(item.path);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={createPageUrl(item.path)}
              className="relative flex items-center justify-center w-12 h-12 transition-all duration-300"
            >
              <div
                className={`
                  flex items-center justify-center rounded-[14px] w-12 h-12 transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-br from-[#E8DEFF] to-[#D4E7FF] clay-shadow scale-105' 
                    : 'bg-transparent hover:bg-white/30'
                  }
                `}
              >
                <Icon 
                  className={`w-5 h-5 transition-colors duration-300 ${
                    isActive ? 'text-[#6B5B95]' : 'text-[#8B7355]'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

