import { useState } from 'react';
import { X, Save } from 'lucide-react';

interface Props {
  onSave: (stats: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function UserStatsForm({ onSave, onCancel, isLoading }: Props) {
  const [formData, setFormData] = useState({
    height_cm: 0,
    weight_kg: 0,
    sex: 'male',
    age: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate BMI
    const heightInMeters = formData.height_cm / 100;
    const bmi = formData.weight_kg / (heightInMeters * heightInMeters);
    
    // Calculate TDEE (maintenance calories)
    let tdee;
    if (formData.sex === 'male') {
      tdee = 10 * formData.weight_kg + 6.25 * formData.height_cm - 5 * formData.age + 5;
    } else {
      tdee = 10 * formData.weight_kg + 6.25 * formData.height_cm - 5 * formData.age - 161;
    }
    
    const maintenanceCalories = Math.round(tdee);
    
    onSave({
      ...formData,
      bmi: Math.round(bmi * 10) / 10,
      mtnc_cal: maintenanceCalories,
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/50 backdrop-blur-sm rounded-[20px] p-6 clay-shadow space-y-4">
      <h3 className="font-semibold text-[#6B5B95] mb-4">Health Statistics</h3>
      
      {/* Sex */}
      <div className="space-y-2">
        <label className="text-sm text-[#6B5B95] font-semibold">Sex</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleChange('sex', 'male')}
            className={`flex-1 py-3 rounded-[14px] font-semibold transition-all ${
              formData.sex === 'male'
                ? 'bg-gradient-to-r from-[#D4E7FF] to-[#E8DEFF] text-[#6B5B95] clay-shadow'
                : 'bg-white/50 text-[#8B7355] clay-inset'
            }`}
          >
            Male
          </button>
          <button
            type="button"
            onClick={() => handleChange('sex', 'female')}
            className={`flex-1 py-3 rounded-[14px] font-semibold transition-all ${
              formData.sex === 'female'
                ? 'bg-gradient-to-r from-[#FFE8D6] to-[#FFE0E8] text-[#6B5B95] clay-shadow'
                : 'bg-white/50 text-[#8B7355] clay-inset'
            }`}
          >
            Female
          </button>
        </div>
      </div>

      {/* Age */}
      <div className="space-y-2">
        <label className="text-sm text-[#6B5B95] font-semibold">Age (years)</label>
        <input
          type="number"
          min="1"
          max="120"
          placeholder="Enter age"
          value={formData.age || ''}
          onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
          className="w-full px-4 py-3 bg-white/70 border-2 border-[#E8DEFF] rounded-[14px] text-[#6B5B95] focus:outline-none focus:border-[#6B5B95] focus:bg-white transition-all"
          required
        />
      </div>

      {/* Height */}
      <div className="space-y-2">
        <label className="text-sm text-[#6B5B95] font-semibold">Height (cm)</label>
        <input
          type="number"
          step="0.1"
          min="50"
          max="300"
          placeholder="Enter height in cm"
          value={formData.height_cm || ''}
          onChange={(e) => handleChange('height_cm', parseFloat(e.target.value) || 0)}
          className="w-full px-4 py-3 bg-white/70 border-2 border-[#E8DEFF] rounded-[14px] text-[#6B5B95] focus:outline-none focus:border-[#6B5B95] focus:bg-white transition-all"
          required
        />
      </div>

      {/* Weight */}
      <div className="space-y-2">
        <label className="text-sm text-[#6B5B95] font-semibold">Weight (kg)</label>
        <input
          type="number"
          step="0.1"
          min="20"
          max="500"
          placeholder="Enter weight"
          value={formData.weight_kg || ''}
          onChange={(e) => handleChange('weight_kg', parseFloat(e.target.value) || 0)}
          className="w-full px-4 py-3 bg-white/70 border-2 border-[#E8DEFF] rounded-[14px] text-[#6B5B95] focus:outline-none focus:border-[#6B5B95] focus:bg-white transition-all"
          required
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-12 rounded-[14px] bg-white/50 clay-shadow clay-hover text-[#8B7355] flex items-center justify-center gap-2 font-semibold"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 h-12 bg-gradient-to-r from-[#D4F1E8] to-[#D4E7FF] text-[#6B5B95] rounded-[14px] clay-shadow clay-hover font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isLoading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

