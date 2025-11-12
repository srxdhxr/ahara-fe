import { TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";

interface DailyData {
  date: string;
  total_calories: number;
}

interface Props {
  dailyData: DailyData[];
  lowerLimit?: number | null;
  upperLimit?: number | null;
}

export default function CalorieChart({ dailyData, lowerLimit, upperLimit }: Props) {
  const maxCalories = Math.max(...dailyData.map(d => d.total_calories), upperLimit || 0, 2000);
  const chartHeight = 200;

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-[20px] p-6 clay-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-[#E8DEFF] to-[#D4E7FF] rounded-[16px] flex items-center justify-center clay-inset">
          <TrendingUp className="w-6 h-6 text-[#6B5B95]" strokeWidth={2} />
        </div>
        <div>
          <h3 className="font-semibold text-[#6B5B95]">Daily Calorie Intake</h3>
          <p className="text-xs text-[#8B7355]">Last 7 days</p>
        </div>
      </div>

      {/* Simple Bar Chart */}
      <div className="relative" style={{ height: chartHeight }}>
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full h-px bg-[#E8DEFF] opacity-50"></div>
          ))}
        </div>

        {/* Upper Limit Line */}
        {upperLimit && (
          <div 
            className="absolute left-0 right-0 border-t-2 border-dashed border-red-400"
            style={{ 
              top: `${((maxCalories - upperLimit) / maxCalories) * chartHeight}px` 
            }}
          >
            <span className="text-xs text-red-600 bg-white/80 px-2 py-0.5 rounded absolute -top-3 right-0">
              Upper: {upperLimit}
            </span>
          </div>
        )}

        {/* Lower Limit Line */}
        {lowerLimit && (
          <div 
            className="absolute left-0 right-0 border-t-2 border-dashed border-orange-400"
            style={{ 
              top: `${((maxCalories - lowerLimit) / maxCalories) * chartHeight}px` 
            }}
          >
            <span className="text-xs text-orange-600 bg-white/80 px-2 py-0.5 rounded absolute -top-3 right-0">
              Lower: {lowerLimit}
            </span>
          </div>
        )}

        {/* Bars */}
        <div className="absolute inset-0 flex items-end justify-around gap-1 px-2">
          {dailyData.map((day, index) => {
            const barHeight = (day.total_calories / maxCalories) * chartHeight;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-[#6B5B95] to-[#8B7DAB] rounded-t-[6px] transition-all hover:opacity-80 cursor-pointer relative group"
                  style={{ height: `${barHeight}px`, minHeight: day.total_calories > 0 ? '4px' : '0' }}
                >
                  {/* Tooltip on hover */}
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white/90 backdrop-blur-sm rounded-[8px] p-2 clay-shadow whitespace-nowrap z-10">
                    <p className="text-xs font-bold text-[#6B5B95]">{Math.round(day.total_calories)} cal</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* X-Axis Labels */}
      <div className="flex justify-around mt-3 px-2">
        {dailyData.map((day, index) => (
          <div key={index} className="flex-1 text-center">
            <p className="text-xs text-[#8B7355]">
              {format(parseISO(day.date), 'EEE')}
            </p>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-6 justify-center text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-2 bg-gradient-to-r from-[#6B5B95] to-[#8B7DAB] rounded-full"></div>
          <span className="text-[#8B7355]">Daily Calories</span>
        </div>
        {upperLimit && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 border-t-2 border-dashed border-red-400"></div>
            <span className="text-[#8B7355]">Upper Limit</span>
          </div>
        )}
        {lowerLimit && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 border-t-2 border-dashed border-orange-400"></div>
            <span className="text-[#8B7355]">Lower Limit</span>
          </div>
        )}
      </div>
    </div>
  );
}

