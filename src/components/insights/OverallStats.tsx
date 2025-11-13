import { Utensils, Flame, Beef, Droplet, Wheat } from "lucide-react";

interface Props {
  totalMeals: number;
  avgCalories: number;
  avgProtein: number;
  avgFat: number;
  avgCarbs: number;
}

export default function OverallStats({ totalMeals, avgCalories, avgProtein, avgFat, avgCarbs }: Props) {
  const stats = [
    { 
      label: "Total Meals", 
      value: totalMeals, 
      icon: Utensils, 
      color: "from-[#E8DEFF] to-[#D4E7FF]",
      unit: ""
    },
    { 
      label: "Avg Calories", 
      value: avgCalories, 
      icon: Flame, 
      color: "from-[#FFE8D6] to-[#FFE0E8]",
      unit: "kcal"
    },
    { 
      label: "Avg Protein", 
      value: avgProtein, 
      icon: Beef, 
      color: "from-[#D4F1E8] to-[#D4E7FF]",
      unit: "g"
    },
    { 
      label: "Avg Fat", 
      value: avgFat, 
      icon: Droplet, 
      color: "from-[#D4E7FF] to-[#E8DEFF]",
      unit: "g"
    },
    { 
      label: "Avg Carbs", 
      value: avgCarbs, 
      icon: Wheat, 
      color: "from-[#FFE0E8] to-[#FFE8D6]",
      unit: "g"
    }
  ];

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-[16px] p-4 clay-shadow space-y-3">
      <h2 className="text-sm font-semibold text-[#6B5B95]">Weekly Overview</h2>
      
      <div className="grid grid-cols-2 gap-2">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`bg-white/50 backdrop-blur-sm rounded-[14px] p-3 clay-inset ${
                index === 0 ? 'col-span-2' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 bg-gradient-to-br ${stat.color} rounded-[10px] flex items-center justify-center clay-inset flex-shrink-0`}>
                  <Icon className="w-4 h-4 text-[#6B5B95]" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-[#8B7355] mb-0.5">{stat.label}</p>
                  <p className="text-lg font-bold text-[#6B5B95] truncate">
                    {Math.round(stat.value)}
                    {stat.unit && (
                      <span className="text-xs font-normal text-[#8B7355] ml-1">{stat.unit}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

