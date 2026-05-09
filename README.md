# Healthify

Your AI-powered nutrition assistant with meal planning, calorie tracking, and hydration goals. Frontend is React + Vite; backend is Express + MongoDB; AI plans use Gemini.

## Quick Start
- Prerequisites: Node 18+, npm, a MongoDB Atlas cluster, a Gemini API key, Firebase web app credentials.
- Install dependencies:
  - Server: `cd server && npm install`
  - Client: `cd client && npm install`
- Environment:
  - Server `.env`:
    - `PORT=5000`
    - `MONGO_URI=your-mongodb-uri-with-db-name`
    - `GEMINI_API_KEY=your-gemini-api-key`
  - Client `.env`:
    - `VITE_FIREBASE_API_KEY=...`
    - `VITE_FIREBASE_AUTH_DOMAIN=...`
    - `VITE_FIREBASE_PROJECT_ID=...`
    - `VITE_FIREBASE_STORAGE_BUCKET=...`
    - `VITE_FIREBASE_MESSAGING_SENDER_ID=...`
    - `VITE_FIREBASE_APP_ID=...`
    - `VITE_FIREBASE_MEASUREMENT_ID=...`
- Run dev servers:
  - Backend: `cd server && npm run dev` (port 5000)
  - Frontend: `cd client && npm run dev` then open http://localhost:5173/

## Features
- Firebase login with Google/email and backend user sync.
- Profile with age, dietary preferences, health goals, calorie goal, hydration target.
- AI meal plan generation (Breakfast/Lunch/Dinner/Snack) with calories.
- Toggle meals to track daily calories and completion count.
- Progress logging: weight, water intake, calories, mood; chart visualization.
- Polished UI with images, transitions, and responsive layout.

## Architecture
- Backend server entry: [server.js](file:///c:/Users/boate/OneDrive/Desktop/Healthify/server/server.js)
- DB connection: [db.js](file:///c:/Users/boate/OneDrive/Desktop/Healthify/server/config/db.js)
- Models: [User.js](file:///c:/Users/boate/OneDrive/Desktop/Healthify/server/models/User.js), [MealPlan.js](file:///c:/Users/boate/OneDrive/Desktop/Healthify/server/models/MealPlan.js), [Progress.js](file:///c:/Users/boate/OneDrive/Desktop/Healthify/server/models/Progress.js)
- Routes: [auth.js](file:///c:/Users/boate/OneDrive/Desktop/Healthify/server/routes/auth.js), [meal.js](file:///c:/Users/boate/OneDrive/Desktop/Healthify/server/routes/meal.js), [progress.js](file:///c:/Users/boate/OneDrive/Desktop/Healthify/server/routes/progress.js)
- AI generation: [gemini.js](file:///c:/Users/boate/OneDrive/Desktop/Healthify/server/utils/gemini.js)
- Client routing: [App.jsx](file:///c:/Users/boate/OneDrive/Desktop/Healthify/client/src/App.jsx)
- Pages: [Home.jsx](file:///c:/Users/boate/OneDrive/Desktop/Healthify/client/src/pages/Home.jsx), [Profile.jsx](file:///c:/Users/boate/OneDrive/Desktop/Healthify/client/src/pages/Profile.jsx), [Tracker.jsx](file:///c:/Users/boate/OneDrive/Desktop/Healthify/client/src/pages/Tracker.jsx), [History.jsx](file:///c:/Users/boate/OneDrive/Desktop/Healthify/client/src/pages/History.jsx)
- Vite proxy: [vite.config.js](file:///c:/Users/boate/OneDrive/Desktop/Healthify/client/vite.config.js)

## API Overview
- POST `/api/meals/log` — Record a meal as eaten with an optional rating.
- GET `/api/progress/week` — Fetch weekly adherence, budget savings, and protein stats.
- GET `/api/meals/feedback-status` — Check recent rating consistency for smart personalized nudges.
- GET `/api/meals/grocery/week` — Aggregate ingredients for the current week's plan.
- POST `/api/meals/plan/add` — Manually add a specific meal to the current plan.

## How It Works
- **Meal Logging:** Check the "I ate this" box on your dashboard to record a meal. You can then provide a 1-5 star rating which helps the AI learn your preferences.
- **Weekly Progress:** The Progress page shows your adherence percentage and nutritional insights based on your logged meals vs. planned meals.
- **AI Feedback Loop:** As you rate meals, the system extracts tags (e.g., "high-protein") and uses them to prioritize future suggestions.
- Profile submission validates input and persists to MongoDB: [Profile.jsx](file:///c:/Users/boate/OneDrive/Desktop/Healthify/client/src/pages/Profile.jsx#L43-L97) and [auth.js](file:///c:/Users/boate/OneDrive/Desktop/Healthify/server/routes/auth.js#L7-L40).
- Home auto-generates a plan if none exists for today: [Home.jsx](file:///c:/Users/boate/OneDrive/Desktop/Healthify/client/src/pages/Home.jsx#L26-L61).
- Meal toggles update calories and meal completion: [meal.js](file:///c:/Users/boate/OneDrive/Desktop/Healthify/server/routes/meal.js#L46-L104).
- Tracker logs daily stats and renders charts: [Tracker.jsx](file:///c:/Users/boate/OneDrive/Desktop/Healthify/client/src/pages/Tracker.jsx).

## Configuration Notes
- MongoDB URI should include the database name: `...mongodb.net/HealthifyDB?...`.
- Client proxy forwards `/api/*` to backend on port 5000.
- Ensure Atlas Network Access whitelists your current IP.
- Gemini JSON responses are parsed and sanitized; fallback meals are provided on error.

## Troubleshooting
- Server not connecting:
  - Verify `MONGO_URI` includes database name.
  - Check Atlas IP whitelist and user credentials.
  - See logs from [db.js](file:///c:/Users/boate/OneDrive/Desktop/Healthify/server/config/db.js).
- Meal generation failing:
  - Confirm `GEMINI_API_KEY` and quota.
  - See errors in [gemini.js](file:///c:/Users/boate/OneDrive/Desktop/Healthify/server/utils/gemini.js).
- Client “Network Error”:
  - Ensure backend at port 5000 and proxy in [vite.config.js](file:///c:/Users/boate/OneDrive/Desktop/Healthify/client/vite.config.js).

