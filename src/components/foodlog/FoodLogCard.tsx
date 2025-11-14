import { Coffee, Utensils, Moon, Apple } from "lucide-react";
import { format } from "date-fns";

interface FoodItem {
  id: number;
  food_name: string;
  total_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface FoodLogSession {
  session_id: number;
  meal_type: string;
  created_at: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  food_items: FoodItem[];
}

interface Props {
  log: FoodLogSession;
}

const mealIcons: Record<string, any> = {
  breakfast: Coffee,
  lunch: Utensils,
  dinner: Moon,
  morning_snack: Apple,
  evening_snack: Apple,
  late_night_snack: Apple,
};

const mealColors: Record<string, string> = {
  breakfast: "from-[#FFE8D6] to-[#FFE0E8]",
  lunch: "from-[#D4F1E8] to-[#D4E7FF]",
  dinner: "from-[#E8DEFF] to-[#D4E7FF]",
  morning_snack: "from-[#D4E7FF] to-[#E8DEFF]",
  evening_snack: "from-[#D4E7FF] to-[#E8DEFF]",
  late_night_snack: "from-[#E8DEFF] to-[#FFE0E8]",
};

const formatMealType = (type: string) => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

export default function FoodLogCard({ log }: Props) {
  const Icon = mealIcons[log.meal_type] || Utensils;
  const colorGradient = mealColors[log.meal_type] || mealColors.breakfast;

  const foodItemsText = log.food_items.map(item => item.food_name).join(', ');

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-[16px] p-3 clay-shadow clay-hover transition-all duration-300">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 bg-gradient-to-br ${colorGradient} rounded-[12px] flex items-center justify-center flex-shrink-0 clay-inset`}>
          <Icon className="w-5 h-5 text-[#6B5B95]" strokeWidth={2} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-[#6B5B95]">{formatMealType(log.meal_type)}</h3>
            <span className="text-[10px] text-[#8B7355]">
              {format(new Date(log.created_at.includes('Z') ? log.created_at : log.created_at + 'Z'), 'h:mm a')}
            </span>
          </div>
          
          <p className="text-xs text-[#8B7355] mb-2 line-clamp-1">{foodItemsText}</p>
          
          <div className="flex flex-wrap gap-1.5">
            <div className="px-2 py-0.5 bg-white/70 rounded-[8px] clay-inset">
              <span className="text-[10px] font-semibold text-[#6B5B95]">
                {Math.round(log.total_calories)} cal
              </span>
            </div>
            <div className="px-2 py-0.5 bg-white/70 rounded-[8px] clay-inset">
              <span className="text-[10px] text-[#8B7355]">
                P: {Math.round(log.total_protein)}g
              </span>
            </div>
            <div className="px-2 py-0.5 bg-white/70 rounded-[8px] clay-inset">
              <span className="text-[10px] text-[#8B7355]">
                C: {Math.round(log.total_carbs)}g
              </span>
            </div>
            <div className="px-2 py-0.5 bg-white/70 rounded-[8px] clay-inset">
              <span className="text-[10px] text-[#8B7355]">
                F: {Math.round(log.total_fat)}g
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

