import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Utensils } from "lucide-react";
import { format } from "date-fns";
import { api } from "../api/client";
import FoodLogCard from "../components/foodlog/FoodLogCard";

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

export default function FoodLogs() {
  const [selectedDate, setSelectedDate] = useState<string>('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['foodLogs', selectedDate],
    queryFn: async () => {
      const response = await api.getFoodLogs(selectedDate || undefined);
      return response.data as FoodLogSession[];
    },
  });

  const totalCalories = logs.reduce((sum, log) => sum + (log.total_calories || 0), 0);

  const clearFilter = () => setSelectedDate('');

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="space-y-2 mb-4">
        <h1 className="text-xl font-bold text-[#6B5B95]" style={{ fontFamily: 'Georgia, serif' }}>
          Food Logs
        </h1>
        <p className="text-[#8B7355] text-xs">Track your daily nutrition</p>
      </div>

      {/* Date Selector - Sticky */}
      <div className="bg-white/50 backdrop-blur-sm rounded-[16px] p-3 clay-shadow mb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#D4E7FF] rounded-[12px] flex items-center justify-center clay-inset">
              <Calendar className="w-4 h-4 text-[#6B5B95]" />
            </div>
            <div>
              <p className="text-[10px] text-[#8B7355]">
                {selectedDate ? 'Selected' : 'All Time'}
              </p>
              <p className="text-sm font-semibold text-[#6B5B95]">
                {selectedDate ? format(new Date(selectedDate), 'MMM d, yyyy') : 'All meals'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#8B7355]">Total</p>
            <p className="text-xl font-bold text-[#6B5B95]">{Math.round(totalCalories)}</p>
            <p className="text-[10px] text-[#8B7355]">cal</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm bg-white/70 border-2 border-[#E8DEFF] rounded-[10px] text-[#6B5B95] focus:outline-none focus:border-[#6B5B95]"
          />
          {selectedDate && (
            <button
              onClick={clearFilter}
              className="px-3 py-1.5 text-xs bg-[#FFE8D6] text-[#6B5B95] rounded-[10px] font-semibold hover:bg-[#FFE0E8] transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Logs List - Scrollable */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white/50 rounded-[16px] p-3 clay-shadow animate-pulse">
              <div className="h-16 w-full rounded-[12px] bg-gray-200"></div>
            </div>
          ))
        ) : logs.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-sm rounded-[16px] p-6 clay-shadow text-center">
            <div className="w-16 h-16 bg-[#FFE8D6] rounded-[14px] flex items-center justify-center mx-auto mb-3 clay-inset">
              <Utensils className="w-8 h-8 text-[#8B7355]" />
            </div>
            <p className="text-[#6B5B95] font-semibold mb-1 text-sm">No meals logged yet</p>
            <p className="text-xs text-[#8B7355]">Tap the + button to log your first meal</p>
          </div>
        ) : (
          logs.map((log) => <FoodLogCard key={log.session_id} log={log} />)
        )}
      </div>
    </div>
  );
}

