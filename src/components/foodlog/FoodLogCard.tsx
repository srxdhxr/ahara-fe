import { Coffee, Utensils, Moon, Apple, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";

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
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const foodItemsText = log.food_items.map(item => item.food_name).join(', ');

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await api.deleteFoodLog(log.session_id);
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch food logs
      queryClient.invalidateQueries({ queryKey: ['foodLogs'] });
      setIsDeleting(false);
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || error.message || 'Failed to delete meal. Please try again.');
      setIsDeleting(false);
    },
  });

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmDelete(false);
    setIsDeleting(true);
    
    try {
      await api.deleteFoodLog(log.session_id);
      queryClient.invalidateQueries({ queryKey: ['foodLogs'] });
      setIsDeleting(false);
    } catch (error: any) {
      alert(error.response?.data?.detail || error.message || 'Failed to delete meal');
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-[16px] p-3 clay-shadow clay-hover transition-all duration-300 relative">
      {showConfirmDelete ? (
        // Confirmation UI - replaces card content
        <div className="py-2">
          <p className="text-sm font-semibold text-[#6B5B95] mb-3 text-center">
            Delete this meal?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleCancelDelete}
              className="flex-1 px-3 py-2 bg-white/70 border-2 border-[#E8DEFF] rounded-[10px] text-[#6B5B95] text-xs font-semibold hover:bg-white/90 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-[#FFE0E8] to-[#FFB3C1] rounded-[10px] text-[#6B5B95] text-xs font-semibold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      ) : (
        // Normal card content
        <>
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
          
          {/* Delete button - bottom right */}
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting || deleteMutation.isPending}
            className="absolute bottom-3 right-3 w-7 h-7 bg-[#FFE0E8] hover:bg-[#FFB3C1] rounded-[8px] flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed clay-shadow z-10"
            title="Delete meal"
            type="button"
          >
            {isDeleting || deleteMutation.isPending ? (
              <div className="w-3.5 h-3.5 border-2 border-[#6B5B95] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Trash2 className="w-3.5 h-3.5 text-[#6B5B95]" strokeWidth={2} />
            )}
          </button>
        </>
      )}
    </div>
  );
}

