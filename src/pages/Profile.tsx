import { useState, useEffect } from "react";
import { User, Scale, Ruler } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../api/client";
import UserStatsForm from "../components/profile/UserStatsForm";
import BMIDisplay from "../components/profile/BMIDisplay";
import CalorieGoals from "../components/profile/CalorieGoals";
import LogoutButton from "../components/LogoutButton";

export default function Profile() {
  const [userDetails, setUserDetails] = useState<any>(null);
  const [userName, setUserName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserDetails();
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const response = await api.getMe();
      setUserName(response.data.name);
    } catch (err) {
      console.error('Failed to load user info');
    }
  };

  const loadUserDetails = async () => {
    try {
      const response = await api.getUserDetails();
      setUserDetails(response.data);
    } catch (err) {
      console.error('No user details found');
    } finally {
      setLoading(false);
    }
  };

  const addStatsMutation = useMutation({
    mutationFn: async (data: any) => {
      // If user details exist, use PUT, otherwise POST
      if (userDetails) {
        const response = await api.updateUserDetails(data);
        return response.data;
      } else {
        const response = await api.addUserDetails(data);
        return response.data;
      }
    },
    onSuccess: (data) => {
      setUserDetails(data);
      setShowForm(false);
      alert('Profile updated successfully!');
    },
    onError: () => {
      alert('Failed to update profile');
    }
  });

  const updateCaloriesMutation = useMutation({
    mutationFn: async (data: { min_cal: number; max_cal: number }) => {
      const response = await api.updateUserDetails(data);
      return response.data;
    },
    onSuccess: (data) => {
      setUserDetails(data);
      alert('Calorie goals updated!');
    },
    onError: () => {
      alert('Failed to update calorie goals');
    }
  });

  const handleSaveStats = (stats: any) => {
    addStatsMutation.mutate(stats);
  };

  const handleSaveCalorieLimits = (limits: { min_cal: number; max_cal: number }) => {
    updateCaloriesMutation.mutate(limits);
  };

  const hasStats = userDetails?.height_cm && userDetails?.weight_kg;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white/50 rounded-[20px] p-8 clay-shadow text-center">
          <p className="text-[#8B7355]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Card */}
      <div className="bg-white/50 backdrop-blur-sm rounded-[24px] p-8 clay-shadow">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-[#E8DEFF] to-[#D4E7FF] rounded-[20px] flex items-center justify-center clay-shadow flex-shrink-0">
            <User className="w-10 h-10 text-[#6B5B95]" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#6B5B95]" style={{ fontFamily: 'Georgia, serif' }}>
              Profile
            </h1>
            <p className="text-[#8B7355] text-sm font-semibold">{userName || 'User'}</p>
          </div>
        </div>
      </div>

      {/* Health Stats */}
      {hasStats && !showForm ? (
        <>
          <BMIDisplay user={userDetails} />
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/50 backdrop-blur-sm rounded-[20px] p-5 clay-shadow">
              <div className="w-12 h-12 bg-[#FFE8D6] rounded-[14px] flex items-center justify-center mb-3 clay-inset">
                <Scale className="w-6 h-6 text-[#6B5B95]" />
              </div>
              <p className="text-2xl font-bold text-[#6B5B95]">
                {userDetails.weight_kg}
                <span className="text-sm font-normal text-[#8B7355] ml-1">kg</span>
              </p>
              <p className="text-xs text-[#8B7355] mt-1">Weight</p>
            </div>
            
            <div className="bg-white/50 backdrop-blur-sm rounded-[20px] p-5 clay-shadow">
              <div className="w-12 h-12 bg-[#D4E7FF] rounded-[14px] flex items-center justify-center mb-3 clay-inset">
                <Ruler className="w-6 h-6 text-[#6B5B95]" />
              </div>
              <p className="text-2xl font-bold text-[#6B5B95]">
                {userDetails.height_cm}
                <span className="text-sm font-normal text-[#8B7355] ml-1">cm</span>
              </p>
              <p className="text-xs text-[#8B7355] mt-1">Height</p>
            </div>
          </div>

          <CalorieGoals 
            user={userDetails}
            onSave={handleSaveCalorieLimits}
            isLoading={updateCaloriesMutation.isPending}
          />

          <button
            onClick={() => setShowForm(true)}
            className="w-full h-14 bg-gradient-to-r from-[#E8DEFF] to-[#D4E7FF] text-[#6B5B95] rounded-[16px] clay-shadow clay-hover font-semibold"
          >
            Update Health Stats
          </button>
        </>
      ) : showForm ? (
        <UserStatsForm 
          onSave={handleSaveStats}
          onCancel={() => setShowForm(false)}
          isLoading={addStatsMutation.isPending}
        />
      ) : (
        <div className="bg-white/50 backdrop-blur-sm rounded-[20px] p-8 clay-shadow text-center space-y-4">
          <div className="w-16 h-16 bg-[#D4F1E8] rounded-[18px] flex items-center justify-center mx-auto clay-inset">
            <Scale className="w-8 h-8 text-[#6B5B95]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#6B5B95] mb-2">Add Your Health Stats</h3>
            <p className="text-sm text-[#8B7355]">
              Add your weight, height, and other details to calculate your BMI and maintenance calories
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="w-full h-14 bg-gradient-to-r from-[#E8DEFF] to-[#D4E7FF] text-[#6B5B95] rounded-[16px] clay-shadow clay-hover font-semibold"
          >
            Add Health Stats
          </button>
        </div>
      )}

      <LogoutButton />
    </div>
  );
}

