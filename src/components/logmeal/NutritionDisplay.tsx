import { Flame, Droplet, Wheat, Beef } from "lucide-react";

interface FoodItem {
  name: string;
  calories: number;
}

interface NutritionData {
  food_items: string[] | FoodItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

interface Props {
  data: NutritionData;
}

export default function NutritionDisplay({ data }: Props) {
  const nutrients = [
    { label: "Calories", value: Math.round(data.total_calories), icon: Flame, color: "from-[#FFE8D6] to-[#FFE0E8]", unit: "kcal" },
    { label: "Protein", value: Math.round(data.total_protein), icon: Beef, color: "from-[#E8DEFF] to-[#D4E7FF]", unit: "g" },
    { label: "Carbs", value: Math.round(data.total_carbs), icon: Wheat, color: "from-[#D4F1E8] to-[#D4E7FF]", unit: "g" },
    { label: "Fat", value: Math.round(data.total_fat), icon: Droplet, color: "from-[#D4E7FF] to-[#E8DEFF]", unit: "g" }
  ];

  const foodItemsList = Array.isArray(data.food_items) 
    ? data.food_items.map(item => typeof item === 'string' ? item : item.name)
    : [];

  return (
    <div className="space-y-2.5">
      {/* Food Items */}
      <div className="bg-white/50 backdrop-blur-sm rounded-[14px] p-3 clay-shadow space-y-1.5">
        <h3 className="text-xs font-semibold text-[#6B5B95] mb-1">✅ Food Items</h3>
        {foodItemsList.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 bg-white/50 rounded-[10px] clay-inset">
            <span className="text-[11px] font-medium text-[#6B5B95]">{item}</span>
          </div>
        ))}
      </div>

      {/* Nutrition Grid */}
      <div className="grid grid-cols-2 gap-2">
        {nutrients.map((nutrient) => {
          const Icon = nutrient.icon;
          return (
            <div
              key={nutrient.label}
              className="bg-white/50 backdrop-blur-sm rounded-[12px] p-2 clay-shadow"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div className={`w-5 h-5 bg-gradient-to-br ${nutrient.color} rounded-[7px] flex items-center justify-center clay-inset flex-shrink-0`}>
                  <Icon className="w-2.5 h-2.5 text-[#6B5B95]" strokeWidth={2} />
                </div>
                <p className="text-[9px] text-[#8B7355] font-medium">{nutrient.label}</p>
              </div>
              <p className="text-sm font-bold text-[#6B5B95] ml-0.5">
                {nutrient.value}
                <span className="text-[9px] font-normal text-[#8B7355] ml-1">{nutrient.unit}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

