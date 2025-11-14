import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
        <p className="text-[#8B7355] text-xs">
          Describe what you ate with details and quantities - the more specific, the better!
        </p>
      </div>

      {/* Meal Type Selector */}
      <div className={`transition-all duration-500 ${(transcript || nutritionData) ? 'scale-95' : ''}`}>
        <MealTypeSelector selected={mealType} onSelect={setMealType} />
      </div>

      {/* Main Content Area - Fixed Space */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Check User Details */}
        {hasUserDetails === false && !transcript && !isTranscribing && (
          <div className="bg-white/50 backdrop-blur-sm rounded-[20px] p-6 clay-shadow text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FFE8D6] to-[#FFE0E8] rounded-[18px] flex items-center justify-center mx-auto mb-4 clay-inset">
              <Sparkles className="w-8 h-8 text-[#6B5B95]" />
            </div>
            <h3 className="text-lg font-semibold text-[#6B5B95] mb-2">Complete Your Profile</h3>
            <p className="text-sm text-[#8B7355] mb-4 leading-relaxed">
              Before logging meals, please update your profile with your height, weight, and other details. This helps us provide accurate nutrition tracking!
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="w-full h-12 bg-gradient-to-r from-[#E8DEFF] to-[#D4E7FF] text-[#6B5B95] rounded-[16px] clay-shadow font-semibold hover:scale-105 transition-all"
            >
              Go to Profile
            </button>
          </div>
        )}

        {/* Record Button - Only show when user has details and no transcript */}
        {hasUserDetails === true && !transcript && !isTranscribing && (
          <div className="flex justify-center">
            <button
              onClick={toggleRecording}
              disabled={isTranscribing || processMutation.isPending}
              className={`w-56 h-16 rounded-[20px] transition-all duration-300 flex items-center justify-center gap-3 ${
                isRecording 
                  ? 'bg-gradient-to-br from-[#FFE0E8] to-[#FFE8D6] clay-shadow animate-pulse' 
                  : 'bg-gradient-to-br from-[#E8DEFF] to-[#D4E7FF] clay-shadow hover:scale-105'
              } disabled:opacity-50`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-6 h-6 text-[#6B5B95]" strokeWidth={2} />
                  <span className="text-base font-semibold text-[#6B5B95]">Stop Recording</span>
                </>
              ) : (
                <>
                  <Mic className="w-6 h-6 text-[#6B5B95]" strokeWidth={2} />
                  <span className="text-base font-semibold text-[#6B5B95]">Start Recording</span>
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