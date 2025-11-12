import { Activity } from "lucide-react";

export default function BMIDisplay({ user }: any) {
  const bmi = user?.bmi;
  
  if (!bmi) return null;

  let category = "";
  let color = "";
  let bgGradient = "";
  
  if (bmi < 18.5) {
    category = "Underweight";
    color = "text-blue-600";
    bgGradient = "from-[#D4E7FF] to-[#E8DEFF]";
  } else if (bmi >= 18.5 && bmi < 25) {
    category = "Normal";
    color = "text-green-600";
    bgGradient = "from-[#D4F1E8] to-[#D4E7FF]";
  } else if (bmi >= 25 && bmi < 30) {
    category = "Overweight";
    color = "text-orange-600";
    bgGradient = "from-[#FFE8D6] to-[#FFE0E8]";
  } else {
    category = "Obese";
    color = "text-red-600";
    bgGradient = "from-[#FFE0E8] to-[#FFE8D6]";
  }

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-[20px] p-6 clay-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${bgGradient} rounded-[16px] flex items-center justify-center clay-inset`}>
          <Activity className="w-6 h-6 text-[#6B5B95]" />
        </div>
        <div>
          <h3 className="font-semibold text-[#6B5B95]">Body Mass Index</h3>
          <p className="text-xs text-[#8B7355]">Your BMI calculation</p>
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-5xl font-bold text-[#6B5B95]">{bmi.toFixed(1)}</p>
          <p className={`text-sm font-semibold mt-2 ${color}`}>{category}</p>
        </div>
        
        <div className="text-right text-xs text-[#8B7355] space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>&lt; 18.5 Underweight</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            <span>18.5 - 24.9 Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
            <span>25 - 29.9 Overweight</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            <span>≥ 30 Obese</span>
          </div>
        </div>
      </div>
    </div>
  );
}

