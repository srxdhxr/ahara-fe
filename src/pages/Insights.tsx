import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import OverallStats from "../components/insights/OverallStats";
import CalorieChart from "../components/insights/CalorieChart";

export default function Insights() {
  const { data: weeklyStats, isLoading: statsLoading } = useQuery({
    queryKey: ['weeklyStats'],
    queryFn: async () => {
      const response = await api.getWeeklyStats();
      return response.data;
    },
  });

  const { data: graphData, isLoading: graphLoading } = useQuery({
    queryKey: ['calorieGraph'],
    queryFn: async () => {
      const response = await api.getCalorieGraph(7);
      return response.data;
    },
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-[#6B5B95]" style={{ fontFamily: 'Georgia, serif' }}>
          Insights
        </h1>
        <p className="text-[#8B7355] text-xs">Your nutrition overview</p>
      </div>

      {/* Overall Stats */}
      {statsLoading ? (
        <div className="bg-white/50 rounded-[16px] p-4 clay-shadow animate-pulse">
          <div className="h-32 bg-gray-200 rounded-[12px]"></div>
        </div>
      ) : weeklyStats ? (
        <OverallStats
          totalMeals={weeklyStats.total_meals}
          avgCalories={weeklyStats.avg_calories}
          avgProtein={weeklyStats.avg_protein}
          avgFat={weeklyStats.avg_fat}
          avgCarbs={weeklyStats.avg_carbs}
        />
      ) : null}

      {/* Calorie Chart */}
      {graphLoading ? (
        <div className="bg-white/50 rounded-[16px] p-4 clay-shadow animate-pulse">
          <div className="h-64 bg-gray-200 rounded-[12px]"></div>
        </div>
      ) : graphData ? (
        <CalorieChart 
          dailyData={graphData.daily_data}
          lowerLimit={graphData.min_cal}
          upperLimit={graphData.max_cal}
        />
      ) : null}
    </div>
  );
}


