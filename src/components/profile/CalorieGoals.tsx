import { useState } from "react";
import { Activity, Edit2, Save, X } from "lucide-react";

interface Props {
  user: any;
  onSave: (limits: { min_cal: number; max_cal: number }) => void;
  isLoading: boolean;
}

export default function CalorieGoals({ user, onSave, isLoading }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [limits, setLimits] = useState({
    max_cal: user?.max_cal || user?.mtnc_cal || 0,
    min_cal: user?.min_cal || Math.round((user?.mtnc_cal || 0) * 0.8)
  });

  const handleSave = () => {
    onSave(limits);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLimits({
      max_cal: user?.max_cal || user?.mtnc_cal || 0,
      min_cal: user?.min_cal || Math.round((user?.mtnc_cal || 0) * 0.8)
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-[20px] p-6 clay-shadow space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#D4F1E8] to-[#D4E7FF] rounded-[16px] flex items-center justify-center clay-inset">
            <Activity className="w-6 h-6 text-[#6B5B95]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#6B5B95]">Calorie Goals</h3>
            <p className="text-xs text-[#8B7355]">Daily calorie targets</p>
          </div>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="h-10 w-10 rounded-[12px] clay-hover flex items-center justify-center"
          >
            <Edit2 className="w-4 h-4 text-[#6B5B95]" />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="upper" className="text-[#6B5B95] text-sm font-semibold">
              Upper Limit (kcal)
            </label>
            <input
              id="upper"
              type="number"
              value={limits.max_cal}
              onChange={(e) => setLimits({ ...limits, max_cal: parseInt(e.target.value) })}
              className="w-full px-4 py-2 rounded-[14px] bg-white/70 border-2 border-[#E8DEFF] text-[#6B5B95] focus:outline-none focus:border-[#6B5B95]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="lower" className="text-[#6B5B95] text-sm font-semibold">
              Lower Limit (kcal)
            </label>
            <input
              id="lower"
              type="number"
              value={limits.min_cal}
              onChange={(e) => setLimits({ ...limits, min_cal: parseInt(e.target.value) })}
              className="w-full px-4 py-2 rounded-[14px] bg-white/70 border-2 border-[#E8DEFF] text-[#6B5B95] focus:outline-none focus:border-[#6B5B95]"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 h-10 rounded-[12px] bg-white/50 clay-shadow clay-hover text-[#8B7355] flex items-center justify-center gap-2 font-semibold"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 h-10 bg-gradient-to-r from-[#D4F1E8] to-[#D4E7FF] text-[#6B5B95] rounded-[12px] clay-shadow clay-hover font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Maintenance Calories */}
          <div className="text-center p-4 bg-white/50 rounded-[16px] clay-inset">
            <p className="text-xs text-[#8B7355] mb-1">Maintenance</p>
            <p className="text-4xl font-bold text-[#6B5B95]">{user?.mtnc_cal || 0}</p>
            <p className="text-sm text-[#8B7355] mt-1">kcal/day</p>
          </div>

          {/* Upper and Lower Limits */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-4 bg-gradient-to-br from-[#D4F1E8] to-[#D4E7FF] rounded-[16px] clay-inset">
              <p className="text-xs text-[#8B7355] mb-1">Upper Limit</p>
              <p className="text-2xl font-bold text-[#6B5B95]">
                {user?.max_cal || user?.mtnc_cal || 0}
              </p>
              <p className="text-xs text-[#8B7355] mt-1">kcal</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-[#FFE8D6] to-[#FFE0E8] rounded-[16px] clay-inset">
              <p className="text-xs text-[#8B7355] mb-1">Lower Limit</p>
              <p className="text-2xl font-bold text-[#6B5B95]">
                {user?.min_cal || Math.round((user?.mtnc_cal || 0) * 0.8)}
              </p>
              <p className="text-xs text-[#8B7355] mt-1">kcal</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

