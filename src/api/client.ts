import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:80',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  register: async (data: { email: string; password: string; name: string }) => {
    const response = await apiClient.post('/register', {
      email: data.email,
      password: data.password,
      name: data.name,
    });
    return response;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await apiClient.post('/login', {
      email: data.email,
      password: data.password,
    });
    localStorage.setItem('access_token', response.data.access_token);
    return response;
  },

  logout: () => {
    localStorage.removeItem('access_token');
  },

  getMe: () =>
    apiClient.get('/me'),

  // User Details
  addUserDetails: (data: { height_cm: number; weight_kg: number; sex: string; age: number; bmi: number; mtnc_cal: number }) =>
    apiClient.post('/user_details', data),

  getUserDetails: () =>
    apiClient.get('/user_details'),

  updateUserDetails: (data: any) =>
    apiClient.put('/user_details', data),

  // Food Logs
  getFoodLogs: (date?: string) => {
    const timezoneOffset = new Date().getTimezoneOffset();
    return apiClient.get('/food_logs', { 
      params: date ? { date, timezone_offset: timezoneOffset } : {} 
    });
  },

  // Insights
  getWeeklyStats: () =>
    apiClient.get('/weekly_stats'),

  getCalorieGraph: (days: number = 7) =>
    apiClient.get('/calorie_graph', { params: { days } }),

  // Meal Tracking
  transcribeAudio: (formData: FormData) =>
    apiClient.post('/transcribe_audio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  processMeal: (sessionId: number) =>
    apiClient.post(`/process_meal/${sessionId}`),

  // OTP
  sendOTP: (email: string) =>
    apiClient.post('/send_otp', { email }),
  
  verifyOTP: (email: string, otp: string) =>
    apiClient.post('/verify_otp', { email, otp }),

  // Chat
  sendChatMessage: (message: string) => {
    const timezoneOffset = new Date().getTimezoneOffset();
    return apiClient.post('/chat', { message }, { params: { timezone_offset: timezoneOffset } });
  },
};

export default apiClient;

