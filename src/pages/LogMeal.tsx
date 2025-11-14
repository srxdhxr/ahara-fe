import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Mic, MicOff, Save, X, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import MealTypeSelector from "../components/logmeal/MealTypeSelector";
import NutritionDisplay from "../components/logmeal/NutritionDisplay";

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pb-24 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#F5F1ED] rounded-[24px] clay-shadow max-w-md w-full max-h-[75vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}


interface NutritionData {
  food_items: string[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

export default function LogMeal() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [userName, setUserName] = useState("there");
  const [mealType, setMealType] = useState("breakfast");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hasUserDetails, setHasUserDetails] = useState<boolean | null>(null);
  
  // Get today's date for fetching food logs
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayLocal = `${year}-${month}-${day}`;
  
  // Get yesterday's date
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayYear = yesterday.getFullYear();
  const yesterdayMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
  const yesterdayDay = String(yesterday.getDate()).padStart(2, '0');
  const yesterdayLocal = `${yesterdayYear}-${yesterdayMonth}-${yesterdayDay}`;
  
  // Fetch user details for calorie limits
  const { data: userDetails } = useQuery({
    queryKey: ['userDetails'],
    queryFn: async () => {
      const response = await api.getUserDetails();
      return response.data as { min_cal: number | null; max_cal: number | null };
    },
    enabled: hasUserDetails === true,
  });
  
  // Fetch today's food logs
  const { data: todayLogs = [] } = useQuery({
    queryKey: ['foodLogs', todayLocal],
    queryFn: async () => {
      const response = await api.getFoodLogs(todayLocal);
      return response.data as Array<{
        total_calories: number;
        total_protein: number;
        total_carbs: number;
        total_fat: number;
      }>;
    },
    enabled: hasUserDetails === true,
  });
  
  // Fetch yesterday's food logs
  const { data: yesterdayLogs = [] } = useQuery({
    queryKey: ['foodLogs', yesterdayLocal],
    queryFn: async () => {
      const response = await api.getFoodLogs(yesterdayLocal);
      return response.data as Array<{
        total_calories: number;
      }>;
    },
    enabled: hasUserDetails === true,
  });
  
  // Calculate today's totals
  const todayTotalCalories = todayLogs.reduce((sum, log) => sum + (log.total_calories || 0), 0);
  const todayTotalProtein = todayLogs.reduce((sum, log) => sum + (log.total_protein || 0), 0);
  const todayTotalCarbs = todayLogs.reduce((sum, log) => sum + (log.total_carbs || 0), 0);
  const todayTotalFat = todayLogs.reduce((sum, log) => sum + (log.total_fat || 0), 0);
  
  // Calculate yesterday's total calories
  const yesterdayTotalCalories = yesterdayLogs.reduce((sum, log) => sum + (log.total_calories || 0), 0);
  
  // Calculate today's calorie goal
  const calculateTodayCalGoal = () => {
    if (!userDetails?.min_cal || !userDetails?.max_cal) {
      return null;
    }
    
    const minCal = userDetails.min_cal;
    const maxCal = userDetails.max_cal;
    
    // If today's consumed calories > upper limit, adjust goal
    if (todayTotalCalories > maxCal) {
      // Goal = min(1.2 * (consumed_calories - upper_limit), 0.75 * lower_limit)
      const penalty = 1.2 * (todayTotalCalories - maxCal);
      const minGoal = 0.75 * minCal;
      return Math.round(Math.min(penalty, minGoal));
    }
    
    // Otherwise, use yesterday's logic
    if (yesterdayTotalCalories > maxCal) {
      // If yesterday was more than upper limit: 1.5 * (yesterdayTotalCal - upperLimitCal)
      return Math.round(1.5 * (yesterdayTotalCalories - maxCal));
    } else if (yesterdayTotalCalories < minCal) {
      // If yesterday was less than lower limit: goal is UpperLimitCal
      return maxCal;
    } else {
      // Otherwise, use upper limit as goal
      return maxCal;
    }
  };
  
  const todayCalGoal = calculateTodayCalGoal();
  
  // Determine status: green/mellow if within goal, red if above
  const getCalorieStatus = () => {
    if (todayCalGoal === null) return null;
    if (todayTotalCalories > todayCalGoal) {
      return 'red'; // Above goal
    } else {
      return 'green'; // Within goal
    }
  };
  
  const calorieStatus = getCalorieStatus();
  
  // Store in sessionStorage for chat context
  useEffect(() => {
    if (hasUserDetails === true && todayCalGoal !== null) {
      const contextData = {
        todayTotalCalories: Math.round(todayTotalCalories),
        todayTotalProtein: Math.round(todayTotalProtein),
        todayTotalCarbs: Math.round(todayTotalCarbs),
        todayTotalFat: Math.round(todayTotalFat),
        todayCalGoal: todayCalGoal,
        calorieStatus: calorieStatus,
        timestamp: new Date().toISOString()
      };
      sessionStorage.setItem('nutritionContext', JSON.stringify(contextData));
    }
  }, [todayTotalCalories, todayTotalProtein, todayTotalCarbs, todayTotalFat, todayCalGoal, calorieStatus, hasUserDetails]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<Date | null>(null);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Fetch user info
    api.getMe().then(response => {
      setUserName(response.data.name);
    }).catch(() => {});

    // Check if user has details
    api.getUserDetails().then(() => {
      setHasUserDetails(true);
    }).catch((error) => {
      if (error.response?.status === 404) {
        setHasUserDetails(false);
      }
    });

    // Cleanup: Clear timeout on unmount
    return () => {
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        
        if (audioChunksRef.current.length === 0) {
          setIsRecording(false);
          setIsTranscribing(false);
          return;
        }

        setIsTranscribing(true);
        
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
          
          const formData = new FormData();
          formData.append('audio_file', audioFile);
          formData.append('meal_type', mealType);
          formData.append('start_time', startTimeRef.current?.toISOString() || new Date().toISOString());
          formData.append('end_time', new Date().toISOString());

          const response = await api.transcribeAudio(formData);
          setTranscript(response.data.transcript);
        } catch (error) {
          console.error('Transcription error:', error);
          alert('Failed to transcribe audio. Please try again.');
        } finally {
          setIsRecording(false);
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      startTimeRef.current = new Date();
      setIsRecording(true);
      setTranscript("");
      setNutritionData(null);
      mediaRecorder.start();

      recordingTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, 120000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };


  const processMutation = useMutation({
    mutationFn: async () => {
      if (!transcript) throw new Error('No transcript');
      setShowModal(true);
      const response = await api.processMeal({
        transcript,
        meal_type: mealType,
        start_time: startTimeRef.current?.toISOString() || new Date().toISOString(),
        end_time: new Date().toISOString(),
      });
      return response.data;
    },
    onSuccess: (data) => {
      setNutritionData({
        food_items: data.food_items,
        total_calories: data.total_calories,
        total_protein: data.total_protein,
        total_carbs: data.total_carbs,
        total_fat: data.total_fat,
      });
      queryClient.invalidateQueries({ queryKey: ['foodLogs'] });
    },
    onError: () => {
      setShowModal(false);
      alert('Failed to process meal');
    }
  });

  const handleDiscard = () => {
    setTranscript("");
    setNutritionData(null);
    setShowModal(false);
  };

  const handleReRecord = () => {
    setTranscript("");
    setNutritionData(null);
  };

  const handleDone = () => {
    setShowModal(false);
    navigate('/food-logs');
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="space-y-6 min-h-[calc(100vh-200px)] flex flex-col max-w-md mx-auto w-full px-4">

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-[#6B5B95]" style={{ fontFamily: 'Georgia, serif' }}>
          Hey {userName},
        </h1>
        {hasUserDetails === true && (
          <p className="text-[#8B7355] text-xs">
            Describe what you ate with details and quantities - the more specific, the better!
          </p>
        )}
      </div>

      {/* App Explanation - Only show when user doesn't have details */}
      {hasUserDetails === false && (
        <div className="bg-white/50 backdrop-blur-sm rounded-[20px] p-6 clay-shadow text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#FFE8D6] to-[#FFE0E8] rounded-[18px] flex items-center justify-center mx-auto clay-inset">
            <Sparkles className="w-8 h-8 text-[#6B5B95]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-[#6B5B95]" style={{ fontFamily: 'Georgia, serif' }}>
              Welcome to Ahara
            </h2>
            <p className="text-sm text-[#8B7355] leading-relaxed">
              Your personal AI nutritionist that helps you track meals, monitor your daily nutrition, and get personalized dietary advice. Simply speak or type what you eat, and we'll handle the rest!
            </p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="w-full h-12 bg-gradient-to-r from-[#E8DEFF] to-[#D4E7FF] text-[#6B5B95] rounded-[16px] clay-shadow font-semibold hover:scale-105 transition-all"
          >
            Create Your Profile
          </button>
        </div>
      )}

      {/* Calory Tracker Container */}
      {hasUserDetails === true && todayCalGoal !== null && (
        <div className="bg-white/50 backdrop-blur-sm rounded-[16px] px-4 py-1.5 clay-shadow -mx-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xs font-semibold text-[#6B5B95]">Tracker</h2>
            {calorieStatus && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  calorieStatus === 'green' 
                    ? 'bg-green-500 animate-pulse' 
                    : 'bg-red-500 animate-pulse'
                }`}></div>
                <span className={`text-[9px] font-medium ${
                  calorieStatus === 'green' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {calorieStatus === 'green' ? 'On Track' : 'Over Consumed!'}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] text-[#8B7355] mb-0.5">Current</p>
              <p className="text-sm font-bold text-[#6B5B95]">{Math.round(todayTotalCalories)}</p>
            </div>
            <div className="text-center">
              <div className="w-px h-6 bg-[#E8DEFF] mx-auto"></div>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-[#8B7355] mb-0.5">Goal</p>
              <p className="text-sm font-bold text-[#6B5B95]">{todayCalGoal}</p>
            </div>
          </div>
        </div>
      )}

      {/* Today's Total Container */}
      {hasUserDetails === true && (
        <div className="bg-white/50 backdrop-blur-sm rounded-[16px] px-4 py-1.5 clay-shadow -mx-4 -mt-1">
          <p className="text-xs text-[#8B7355] mb-1 text-center">Today's Total</p>
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 text-center">
              <p className="text-sm font-semibold text-[#6B5B95]">{Math.round(todayTotalCalories)}</p>
              <p className="text-[10px] text-[#8B7355]">cal</p>
            </div>
            <div className="w-px h-6 bg-[#E8DEFF]"></div>
            <div className="flex-1 text-center">
              <p className="text-sm font-semibold text-[#6B5B95]">{Math.round(todayTotalProtein)}</p>
              <p className="text-[10px] text-[#8B7355]">protein</p>
            </div>
            <div className="w-px h-6 bg-[#E8DEFF]"></div>
            <div className="flex-1 text-center">
              <p className="text-sm font-semibold text-[#6B5B95]">{Math.round(todayTotalCarbs)}</p>
              <p className="text-[10px] text-[#8B7355]">carbs</p>
            </div>
            <div className="w-px h-6 bg-[#E8DEFF]"></div>
            <div className="flex-1 text-center">
              <p className="text-sm font-semibold text-[#6B5B95]">{Math.round(todayTotalFat)}</p>
              <p className="text-[10px] text-[#8B7355]">fat</p>
            </div>
          </div>
        </div>
      )}

      {/* Meal Type Selector */}
      <div className={`${hasUserDetails ? '-mt-2' : ''} transition-all duration-500 ${(transcript || nutritionData) ? 'scale-95' : ''}`}>
        <MealTypeSelector selected={mealType} onSelect={setMealType} />
      </div>

      {/* Main Content Area - Fixed Space */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Record Button - Show for all users, but disabled if no details */}
        {!transcript && !isTranscribing && (
          <div className="flex justify-center -mt-2">
            <button
              onClick={toggleRecording}
              disabled={!hasUserDetails || isTranscribing || processMutation.isPending}
              className={`relative w-48 h-12 rounded-[16px] transition-all duration-300 flex items-center justify-center gap-2 ${
                isRecording 
                  ? 'bg-gradient-to-br from-[#FFE0E8] to-[#FFE8D6] clay-shadow animate-pulse' 
                  : 'bg-gradient-to-br from-[#E8DEFF] to-[#D4E7FF] clay-shadow'
              } ${hasUserDetails && !isRecording ? 'hover:scale-105' : ''} disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording 
                  ? 'ring-2 ring-red-400 ring-opacity-75 shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                  : hasUserDetails 
                    ? 'ring-2 ring-[#6B5B95] ring-opacity-50 shadow-[0_0_15px_rgba(107,91,149,0.4)]'
                    : ''
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-5 h-5 text-[#6B5B95]" strokeWidth={2} />
                  <span className="text-sm font-semibold text-[#6B5B95]">Stop Recording</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 text-[#6B5B95]" strokeWidth={2} />
                  <span className="text-sm font-semibold text-[#6B5B95]">Start Recording</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Transcribing */}
        {isTranscribing && (
          <div className="bg-white/50 backdrop-blur-sm rounded-[20px] p-8 clay-shadow text-center w-full">
            <div className="w-16 h-16 border-4 border-[#E8DEFF] border-t-[#6B5B95] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#6B5B95] font-semibold">Transcribing your recording...</p>
            <p className="text-[#8B7355] text-sm mt-2">This will only take a moment</p>
          </div>
        )}

        {/* Transcript - Replaces Record Button */}
        {transcript && !nutritionData && !isTranscribing && (
          <div className="space-y-4">
            <div className="bg-white/50 backdrop-blur-sm rounded-[20px] p-6 clay-shadow space-y-4 w-full">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-[#D4F1E8] rounded-[12px] flex items-center justify-center clay-inset">
                  <Sparkles className="w-4 h-4 text-[#6B5B95]" />
                </div>
                <h3 className="font-semibold text-[#6B5B95]">What you said</h3>
              </div>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full text-[#8B7355] leading-relaxed bg-white/30 p-4 rounded-[12px] border-2 border-transparent focus:border-[#6B5B95]/30 focus:outline-none resize-none min-h-[100px]"
                rows={4}
                placeholder="Edit your transcript here..."
              />
              
              <p className="text-xs text-[#8B7355] text-center italic">
                ✨ Feel free to edit if we missed something! ✨
              </p>
              
              <p className="text-xs text-[#8B7355] text-center">
                Look good? Click analyze or re-record!
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleReRecord}
                className="flex-1 h-12 bg-white/50 clay-shadow text-[#6B5B95] rounded-[16px] font-semibold flex items-center justify-center gap-2"
              >
                <Mic className="w-4 h-4" />
                Re-record
              </button>
              <button
                onClick={() => processMutation.mutate()}
                disabled={processMutation.isPending}
                className="flex-1 h-12 bg-gradient-to-r from-[#E8DEFF] to-[#D4E7FF] text-[#6B5B95] rounded-[16px] clay-shadow font-semibold disabled:opacity-50"
              >
                {processMutation.isPending ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Nutrition Modal */}
      <Modal isOpen={showModal} onClose={handleCloseModal}>
        {processMutation.isPending ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-[#E8DEFF] border-t-[#6B5B95] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#6B5B95] font-semibold">Analyzing nutrition...</p>
            <p className="text-[#8B7355] text-sm mt-2">This will only take a moment</p>
          </div>
        ) : nutritionData ? (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#6B5B95] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              Nutrition Results
            </h2>
            
            <NutritionDisplay data={nutritionData} />
            
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleDiscard}
                className="flex-1 h-12 rounded-[16px] bg-white/50 clay-shadow flex items-center justify-center gap-2 text-[#8B7355] font-semibold"
              >
                <X className="w-5 h-5" />
                Discard
              </button>
              <button
                onClick={handleDone}
                className="flex-1 h-12 bg-gradient-to-r from-[#D4F1E8] to-[#D4E7FF] text-[#6B5B95] rounded-[16px] clay-shadow font-semibold flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Done
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}