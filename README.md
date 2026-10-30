NutriDuo 🦉
Monthly Food Budget, Calorie & Nutrient Tracker with AI Multimodal Vision
A Duolingo-inspired, friendly gamified health app built with React, Express, Node.js, and Google Gemini AI.
🌟 Overview
NutriDuo turns monthly nutritional tracking into a fun, rewarding daily habit. Built with a vibrant Duolingo-style aesthetic, it helps users balance their food budget alongside their monthly target calories, macronutrients, and water intake—calibrated specifically to their age, weight, sex, and blood group.
✨ Key Features
🦉 1. Duolingo-Inspired Gamified UX
NutriBuddy Mascot: Playful animated owl with speech bubbles, cheerful reactions, and supportive health coaching.
Interactive Audio & Tactile Design: Built-in Web Audio API sound effects for button taps, water droplets, and fanfare level-up chimes.
Streaks & XP System: Earn XP for logging meals and drinking water, build daily health streaks, and rank up in health mastery.
💰 2. Monthly Food Budget & Nutrient Target Textboxes
Monthly Allowance: Set your monthly food spending budget in your local currency ($, ₦, €, £, ₹) and track spending efficiency per 1,000 kcal and per 100g of protein.
Nutrient Targets: Input target goals for total calories, protein, carbs, healthy fats, fiber, and water in Liters with auto-calculated daily pace guides.
📸 3. AI Multimodal Food Photo Analysis
Snap or Upload: Upload photos of your meals directly from your camera or gallery with automatic client-side image optimization.
Instant AI Extraction: Powered by Google Gemini AI (gemini-3.1-flash-lite / gemini-3.8-flash) to detect dish names, calories, macros, iron (mg), vitamin C (mg), and health grades.
Amount Spent & Water Logged: Attach the exact amount spent on that food item alongside water consumed in the same log.
💧 4. Water Level Tracking (Bottles & "Pure Water" Sachets)
Bottles & Sachets: Track water intake anytime in standard 500ml / 750ml / 1,000ml bottles or standard 500ml water sachets ("pure water").
Monthly Water Meter: Displays total Liters consumed vs. your monthly hydration target.
🩸 5. Blood Group Biological Personalization
Blood Type Calibration: Select your blood type (A+, A-, B+, B-, AB+, AB-, O+, O-) during onboarding alongside age, weight, and biological sex.
Custom Biological Tips: Every meal analysis and AI recommendation highlights specific metabolic advantages for your blood group (e.g., high lean poultry protein & iron for Type O, plant-based polyphenols for Type A).
🏆 6. Health Challenges & AI Food Recommendations
Monthly Quests: Complete challenges such as Hydration Hero, Iron Blood Booster, Thrifty Protein Master, and Budget Guardian.
Cost-Effective Meal Ideas: AI generates budget-friendly, high-nutrient meal suggestions tailored to your active challenge, blood type, and remaining budget allowance.
🛠️ Tech Stack
Frontend: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons, Canvas Confetti, Web Audio API Synthesizer.
Backend: Node.js, Express, tsx runner, persistent JSON document store.
AI Integration: @google/genai TypeScript SDK with multimodal image vision analysis and structured JSON parsing.
🚀 Getting Started
Prerequisites
Node.js 18+ and npm installed.
GEMINI_API_KEY set in your environment (automatically injected in AI Studio via Settings > Secrets).
Installation & Local Setup
Clone the repository and install dependencies:
code
Bash
npm install
Run the development server:
code
Bash
npm run dev
Open http://localhost:3000 in your browser.
Build for production:
code
Bash
npm run build
npm start
📁 Project Structure
code
Code
├── server.ts                    # Express server, JSON store, Gemini API routes
├── src/
│   ├── App.tsx                  # Main app controller & state orchestration
│   ├── types/index.ts           # TypeScript interfaces
│   ├── components/
│   │   ├── DashboardView.tsx    # Primary gamified health dashboard
│   │   ├── MascotOwl.tsx        # Interactive Duolingo owl mascot component
│   │   ├── UploadFoodModal.tsx  # Photo upload, spend & water logger
│   │   ├── MonthlyGoalModal.tsx # Textboxes for budget & nutrient targets
│   │   ├── QuickWaterModal.tsx  # Standalone water logger
│   │   ├── HealthChallengesModal.tsx # Health quests & AI recommendations
│   │   ├── ProfileModal.tsx     # Age, weight, sex, blood group profile
│   │   └── OnboardingModal.tsx  # Initial setup modal
│   └── utils/
│       └── audio.ts             # Web Audio API sound synthesizer
├── metadata.json                # AI Studio application configuration
└── package.json
📜 License
Apache-2.0 License. 
