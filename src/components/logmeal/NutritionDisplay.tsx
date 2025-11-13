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
    <div className="space-y-3">
      {/* Food Items */}
      <div className="bg-white/50 backdrop-blur-sm rounded-[16px] p-4 clay-shadow space-y-2">
        <h3 className="text-sm font-semibold text-[#6B5B95] mb-2">✅ Food Items</h3>
        {foodItemsList.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 bg-white/50 rounded-[12px] clay-inset">
            <span className="text-xs font-medium text-[#6B5B95]">{item}</span>
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
              className="bg-white/50 backdrop-blur-sm rounded-[12px] p-2.5 clay-shadow"
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className={`w-6 h-6 bg-gradient-to-br ${nutrient.color} rounded-[8px] flex items-center justify-center clay-inset flex-shrink-0`}>
                  <Icon className="w-3 h-3 text-[#6B5B95]" strokeWidth={2} />
                </div>
                <p className="text-[10px] text-[#8B7355] font-medium">{nutrient.label}</p>
              </div>
              <p className="text-base font-bold text-[#6B5B95] ml-0.5">
                {nutrient.value}
                <span className="text-[10px] font-normal text-[#8B7355] ml-1">{nutrient.unit}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

