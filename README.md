# Ahara - AI-Powered Nutrition Tracker

Beautiful, mobile-first nutrition tracking app with voice-to-text meal logging and AI-powered nutritional analysis.

## 🎨 Design

- **Claymorphism UI** - Modern, soft, tactile design
- **Mobile-First** - Optimized for phones
- **Beige/Cream Theme** - Warm, inviting colors

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Visit **http://localhost:5174**

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 Features

### ✅ Authentication
- Sign up / Sign in
- JWT-based auth
- Protected routes

### ✅ Log Meal
- Hold-to-record voice input
- AI transcription (Whisper)
- Automatic nutrition analysis
- Multi-dish support

### ✅ Food Logs
- View all meals
- Date filtering
- Expandable details
- Beautiful meal cards

### ✅ Insights
- Weekly statistics
- 7-day calorie graph
- Average macros
- Calorie limit visualization

### ✅ Profile
- Health stats (height, weight, age, sex)
- BMI calculation
- TDEE/maintenance calories
- Custom calorie goals

## 🔧 Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:8000
```

For production, update to your backend URL.

## 📦 Tech Stack

- **React 18** + TypeScript
- **Vite** - Fast build tool
- **TailwindCSS** - Styling
- **React Query** - Data fetching
- **React Router** - Navigation
- **Axios** - API client
- **Lucide Icons** - Beautiful icons
- **date-fns** - Date utilities

## 🌐 Deployment

Works on any static hosting:
- **Vercel** (recommended - zero config)
- **Netlify**
- **Cloudflare Pages**
- **GitHub Pages**

See `../DEPLOYMENT.md` for full guide.

## 📱 Mobile

Already optimized for mobile:
- Touch-friendly controls
- Responsive design
- PWA-ready meta tags
- Works on iOS & Android browsers
- Can be added to home screen

## 🔗 API Endpoints Used

- `POST /register` - Create account
- `POST /login` - Sign in
- `GET /me` - Get user info
- `POST /user_details` - Add health stats
- `PUT /user_details` - Update stats/calorie goals
- `GET /user_details` - Get health stats
- `POST /transcribe_audio` - Transcribe meal audio
- `POST /process_meal/{id}` - Analyze nutrition
- `GET /food_logs` - Get meal history
- `GET /weekly_stats` - Weekly averages
- `GET /calorie_graph` - Daily calorie data

---

Built with ❤️ using modern web technologies

