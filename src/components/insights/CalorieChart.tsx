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
  const chartHeight = 160;

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-[16px] p-4 clay-shadow">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-[#E8DEFF] to-[#D4E7FF] rounded-[12px] flex items-center justify-center clay-inset">
          <TrendingUp className="w-4 h-4 text-[#6B5B95]" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#6B5B95]">Daily Calorie Intake</h3>
          <p className="text-[10px] text-[#8B7355]">Last 7 days</p>
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
            <span className="text-[10px] text-red-600 bg-white/80 px-1.5 py-0.5 rounded absolute -top-2.5 right-0">
              Upper: {Math.round(upperLimit)}
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
            <span className="text-[10px] text-orange-600 bg-white/80 px-1.5 py-0.5 rounded absolute -top-2.5 right-0">
              Lower: {Math.round(lowerLimit)}
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
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-white/90 backdrop-blur-sm rounded-[6px] px-1.5 py-1 clay-shadow whitespace-nowrap z-10">
                    <p className="text-[10px] font-bold text-[#6B5B95]">{Math.round(day.total_calories)} cal</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* X-Axis Labels */}
      <div className="flex justify-around mt-2 px-2">
        {dailyData.map((day, index) => (
          <div key={index} className="flex-1 text-center">
            <p className="text-[10px] text-[#8B7355]">
              {format(parseISO(day.date), 'EEE')}
            </p>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 justify-center text-[10px]">
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

