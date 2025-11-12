import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "../utils";
import { ScrollText, Plus, TrendingUp, User } from "lucide-react";

export default function MobileNav() {
  const location = useLocation();

  const navItems = [
    { name: "Food Logs", path: "FoodLogs", icon: ScrollText },
    { name: "Log Meal", path: "LogMeal", icon: Plus, isCenter: true },
    { name: "Insights", path: "Insights", icon: TrendingUp },
    { name: "Profile", path: "Profile", icon: User }
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-white/40 backdrop-blur-xl rounded-[24px] clay-shadow border border-white/60 px-2 py-3 z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === createPageUrl(item.path);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={createPageUrl(item.path)}
              className={`relative flex items-center justify-center transition-all duration-300 ${
                item.isCenter 
                  ? 'w-16 h-16 -mt-8' 
                  : 'w-14 h-14'
              }`}
            >
              <div
                className={`
                  flex items-center justify-center rounded-[18px] transition-all duration-300
                  ${item.isCenter 
                    ? 'w-16 h-16 bg-gradient-to-br from-[#E8DEFF] to-[#D4E7FF] clay-shadow' 
                    : `w-14 h-14 ${isActive ? 'bg-[#D4F1E8] clay-shadow' : 'bg-transparent'}`
                  }
                  ${!item.isCenter && 'clay-hover'}
                `}
              >
                <Icon 
                  className={`${
                    item.isCenter ? 'w-7 h-7' : 'w-6 h-6'
                  } transition-colors duration-300 ${
                    isActive ? 'text-[#6B5B95]' : 'text-[#8B7355]'
                  }`}
                  strokeWidth={2.5}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

