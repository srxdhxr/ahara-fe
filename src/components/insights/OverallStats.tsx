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
    <div className="bg-white/50 backdrop-blur-sm rounded-[20px] p-6 clay-shadow space-y-4">
      <h2 className="text-lg font-semibold text-[#6B5B95]">Weekly Overview</h2>
      
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`bg-white/50 backdrop-blur-sm rounded-[18px] p-4 clay-inset ${
                index === 0 ? 'col-span-2' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-[14px] flex items-center justify-center clay-inset flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-[#6B5B95]" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#8B7355] mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#6B5B95]">
                    {stat.value}
                    {stat.unit && (
                      <span className="text-sm font-normal text-[#8B7355] ml-1">{stat.unit}</span>
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

