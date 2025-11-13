import { useState } from "react";
import { Activity, Info } from "lucide-react";

interface Props {
  user: any;
  onSave: (limits: { min_cal: number; max_cal: number }) => void;
  isLoading: boolean;
}

export default function CalorieGoals({ user, onSave, isLoading }: Props) {
  const maintenanceCal = user?.mtnc_cal || 2000;
  const [showInfo, setShowInfo] = useState(false);
  const [limits, setLimits] = useState({
    max_cal: user?.max_cal || maintenanceCal + 300,
    min_cal: user?.min_cal || Math.round(maintenanceCal * 0.8)
  });

  const handleUpperChange = (value: number) => {
    // Upper limit cannot go below maintenance
    const newValue = Math.max(value, maintenanceCal);
    setLimits({ ...limits, max_cal: newValue });
  };

  const handleLowerChange = (value: number) => {
    // Lower limit cannot go above maintenance
    const newValue = Math.min(value, maintenanceCal);
    setLimits({ ...limits, min_cal: newValue });
  };

  const handleSave = () => {
    onSave(limits);
  };

  const showSideEye = limits.max_cal > 6000;

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-[20px] p-6 clay-shadow space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#D4F1E8] to-[#D4E7FF] rounded-[16px] flex items-center justify-center clay-inset">
            <Activity className="w-6 h-6 text-[#6B5B95]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[#6B5B95]">Calorie Goals</h3>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="w-5 h-5 rounded-full bg-[#E8DEFF] flex items-center justify-center clay-hover"
              >
                <Info className="w-3 h-3 text-[#6B5B95]" />
              </button>
            </div>
            <p className="text-xs text-[#8B7355]">Daily calorie targets</p>
          </div>
        </div>
        {showSideEye && (
          <span className="text-2xl" title="That's... a lot of calories! 😅">👀</span>
        )}
      </div>

      {/* Info Box */}
      {showInfo && (
        <div className="bg-[#E8DEFF] rounded-[12px] p-4 text-xs text-[#6B5B95] leading-relaxed">
          <p className="font-semibold mb-2">Why set calorie limits?</p>
          <p className="mb-2">
            <strong>Upper Limit:</strong> Maximum calories for weight gain or maintenance. Stay below this to avoid excessive gain.
          </p>
          <p>
            <strong>Lower Limit:</strong> Minimum calories to maintain health. Eating below this can slow metabolism and cause fatigue.
          </p>
        </div>
      )}

      {/* Maintenance Calories */}
      <div className="text-center p-4 bg-white/50 rounded-[16px] clay-inset">
        <p className="text-xs text-[#8B7355] mb-1">Maintenance</p>
        <p className="text-4xl font-bold text-[#6B5B95]">{maintenanceCal}</p>
        <p className="text-sm text-[#8B7355] mt-1">kcal/day</p>
      </div>

      {/* Upper Limit Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[#6B5B95] text-sm font-semibold">
            Upper Limit
          </label>
          <span className="text-lg font-bold text-[#6B5B95]">{limits.max_cal} kcal</span>
        </div>
        <input
          type="range"
          min={maintenanceCal}
          max={7000}
          step={50}
          value={limits.max_cal}
          onChange={(e) => handleUpperChange(parseInt(e.target.value))}
          onMouseUp={handleSave}
          onTouchEnd={handleSave}
          className="w-full h-2 bg-gradient-to-r from-[#D4F1E8] to-[#D4E7FF] rounded-full appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #D4F1E8 0%, #D4E7FF ${((limits.max_cal - maintenanceCal) / (7000 - maintenanceCal)) * 100}%, #E8DEFF ${((limits.max_cal - maintenanceCal) / (7000 - maintenanceCal)) * 100}%, #E8DEFF 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-[#8B7355]">
          <span>{maintenanceCal}</span>
          <span>7000</span>
        </div>
      </div>

      {/* Lower Limit Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[#6B5B95] text-sm font-semibold">
            Lower Limit
          </label>
          <span className="text-lg font-bold text-[#6B5B95]">{limits.min_cal} kcal</span>
        </div>
        <input
          type="range"
          min={800}
          max={maintenanceCal}
          step={50}
          value={limits.min_cal}
          onChange={(e) => handleLowerChange(parseInt(e.target.value))}
          onMouseUp={handleSave}
          onTouchEnd={handleSave}
          className="w-full h-2 bg-gradient-to-r from-[#FFE8D6] to-[#FFE0E8] rounded-full appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #FFE8D6 0%, #FFE0E8 ${((limits.min_cal - 800) / (maintenanceCal - 800)) * 100}%, #E8DEFF ${((limits.min_cal - 800) / (maintenanceCal - 800)) * 100}%, #E8DEFF 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-[#8B7355]">
          <span>800</span>
          <span>{maintenanceCal}</span>
        </div>
      </div>

      {isLoading && (
        <p className="text-xs text-center text-[#8B7355]">Saving...</p>
      )}
    </div>
  );
}
