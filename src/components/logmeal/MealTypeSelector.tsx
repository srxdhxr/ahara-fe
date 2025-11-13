import { Coffee, Utensils, Moon, Apple } from "lucide-react";

interface Props {
  selected: string;
  onSelect: (type: string) => void;
}

const mealTypes = [
  { value: "breakfast", label: "Breakfast", icon: Coffee, color: "from-[#FFE8D6] to-[#FFE0E8]" },
  { value: "lunch", label: "Lunch", icon: Utensils, color: "from-[#D4F1E8] to-[#D4E7FF]" },
  { value: "dinner", label: "Dinner", icon: Moon, color: "from-[#E8DEFF] to-[#D4E7FF]" },
  { value: "morning_snack", label: "Snack", icon: Apple, color: "from-[#D4E7FF] to-[#E8DEFF]" }
];

export default function MealTypeSelector({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {mealTypes.map((meal) => {
        const Icon = meal.icon;
        const isSelected = selected === meal.value;
        
        return (
          <button
            key={meal.value}
            onClick={() => onSelect(meal.value)}
            className={`
              flex flex-col items-center gap-2 p-4 rounded-[18px] transition-all duration-300
              ${isSelected 
                ? `bg-gradient-to-br ${meal.color} clay-shadow` 
                : 'bg-white/50 clay-inset'
              }
              clay-hover min-h-[100px]
            `}
          >
            <div className={`
              w-12 h-12 rounded-[14px] flex items-center justify-center transition-all
              ${isSelected ? 'bg-white/50 clay-inset' : 'bg-transparent'}
            `}>
              <Icon 
                className={`w-6 h-6 ${isSelected ? 'text-[#6B5B95]' : 'text-[#8B7355]'}`}
                strokeWidth={2}
              />
            </div>
            <span className={`text-xs font-medium ${isSelected ? 'text-[#6B5B95]' : 'text-[#8B7355]'}`}>
              {meal.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

