import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialise Gemini SDK with mandatory telemetry header User-Agent: aistudio-build
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Persistent JSON Store
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'nutriduo_db.json');

interface UserProfile {
  name: string;
  age: number;
  weight: number; // in kg
  sex: 'male' | 'female' | 'other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  currency: string;
  activityLevel: 'sedentary' | 'moderate' | 'active';
  dietPreference: string;
  streakDays: number;
  xp: number;
  level: number;
  onboardingComplete: boolean;
}

interface MonthlyGoal {
  monthKey: string; // e.g. "2026-10"
  foodBudget: number; // monthly target spend
  targetCalories: number; // monthly calories target
  targetProtein: number; // monthly protein target in grams
  targetCarbs: number; // monthly carbs target in grams
  targetFat: number; // monthly fat target in grams
  targetFiber: number; // monthly fiber target in grams
  targetWaterLiters: number; // monthly water target in Liters
  notes?: string;
  updatedAt: string;
}

interface MealNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  ironMg: number;
  calciumMg: number;
  vitaminCMg: number;
  vitaminAIu: number;
  sodiumMg: number;
}

interface MealWater {
  bottles: number;
  sachets: number;
  bottleVolumeMl: number; // e.g. 750ml or 500ml
  sachetVolumeMl: number; // e.g. 500ml
  totalLiters: number;
}

interface MealEntry {
  id: string;
  monthKey: string;
  timestamp: string;
  foodName: string;
  portionDescription: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  amountSpent: number;
  imageUrl?: string;
  nutrients: MealNutrients;
  waterLogged: MealWater;
  healthScore: 'A+' | 'A' | 'B' | 'C' | 'D';
  bloodTypeTip: string;
  mascotCheer: string;
}

interface HealthChallenge {
  id: string;
  title: string;
  description: string;
  category: 'iron' | 'hydration' | 'protein' | 'budget' | 'immunity';
  targetValue: number;
  currentValue: number;
  unit: string;
  rewardXp: number;
  completed: boolean;
  bloodTypeRecommendation: string;
}

interface DatabaseSchema {
  profile: UserProfile;
  monthlyGoals: Record<string, MonthlyGoal>;
  meals: MealEntry[];
  challenges: HealthChallenge[];
}

function getDefaultDB(): DatabaseSchema {
  const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-10"

  return {
    profile: {
      name: 'Alex Rivera',
      age: 26,
      weight: 68,
      sex: 'female',
      bloodGroup: 'O+',
      currency: '$',
      activityLevel: 'moderate',
      dietPreference: 'balanced',
      streakDays: 5,
      xp: 450,
      level: 3,
      onboardingComplete: true,
    },
    monthlyGoals: {
      [currentMonth]: {
        monthKey: currentMonth,
        foodBudget: 350,
        targetCalories: 62000, // ~2,000 kcal / day
        targetProtein: 3100, // ~100g / day
        targetCarbs: 7750, // ~250g / day
        targetFat: 2000, // ~65g / day
        targetFiber: 930, // ~30g / day
        targetWaterLiters: 75, // ~2.5L / day (around 150 sachets/bottles)
        notes: 'Eating lean, staying hydrated with pure sachet and bottle water, keeping within budget!',
        updatedAt: new Date().toISOString(),
      },
    },
    meals: [
      {
        id: 'meal-1',
        monthKey: currentMonth,
        timestamp: new Date(Date.now() - 36 * 3600000).toISOString(),
        foodName: 'Grilled Chicken Bowl with Steamed Quinoa & Veggies',
        portionDescription: '1 medium bowl with roasted bell peppers and broccoli',
        mealType: 'lunch',
        amountSpent: 7.50,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        nutrients: {
          calories: 580,
          protein: 42,
          carbs: 65,
          fat: 14,
          fiber: 9,
          ironMg: 4.2,
          calciumMg: 95,
          vitaminCMg: 45,
          vitaminAIu: 850,
          sodiumMg: 420,
        },
        waterLogged: {
          bottles: 1,
          sachets: 1,
          bottleVolumeMl: 750,
          sachetVolumeMl: 500,
          totalLiters: 1.25,
        },
        healthScore: 'A+',
        bloodTypeTip: 'Excellent for Blood Group O: High lean poultry protein and bioavailable iron support energy metabolism.',
        mascotCheer: 'Feather-tastic! You crushed 42g of protein and 1.25L of water in one meal! 🦉💪',
      },
      {
        id: 'meal-2',
        monthKey: currentMonth,
        timestamp: new Date(Date.now() - 20 * 3600000).toISOString(),
        foodName: 'Avocado Egg Toast & Citrus Slices',
        portionDescription: '2 multigrain toasts, 2 poached eggs, sliced ripe avocado',
        mealType: 'breakfast',
        amountSpent: 4.20,
        imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
        nutrients: {
          calories: 430,
          protein: 19,
          carbs: 34,
          fat: 24,
          fiber: 8,
          ironMg: 2.8,
          calciumMg: 110,
          vitaminCMg: 32,
          vitaminAIu: 620,
          sodiumMg: 350,
        },
        waterLogged: {
          bottles: 1,
          sachets: 0,
          bottleVolumeMl: 750,
          sachetVolumeMl: 500,
          totalLiters: 0.75,
        },
        healthScore: 'A',
        bloodTypeTip: 'Healthy fats and choline support liver function and stable blood sugar for Blood Group O.',
        mascotCheer: 'Sunny start! Nutrient-dense breakfast on an ultra budget! 🥑🍳',
      },
      {
        id: 'meal-3',
        monthKey: currentMonth,
        timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
        foodName: 'Hearty Lentil & Spinach Stew with Sweet Potatoes',
        portionDescription: '1 generous bowl with fresh spinach and garlic',
        mealType: 'dinner',
        amountSpent: 3.80,
        imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
        nutrients: {
          calories: 490,
          protein: 24,
          carbs: 78,
          fat: 8,
          fiber: 16,
          ironMg: 6.8,
          calciumMg: 160,
          vitaminCMg: 58,
          vitaminAIu: 1400,
          sodiumMg: 390,
        },
        waterLogged: {
          bottles: 0,
          sachets: 2,
          bottleVolumeMl: 750,
          sachetVolumeMl: 500,
          totalLiters: 1.0,
        },
        healthScore: 'A+',
        bloodTypeTip: 'Spinach and vitamin C boost iron absorption tremendously, keeping red blood cells vigorous.',
        mascotCheer: 'Iron champion! 6.8mg of iron and 2 cold sachets of water logged! 💧🥬',
      },
    ],
    challenges: [
      {
        id: 'chal-1',
        title: 'Hydration Hero',
        description: 'Log at least 50 sachets or bottles of water this month to achieve optimal cellular hydration.',
        category: 'hydration',
        targetValue: 50,
        currentValue: 5,
        unit: 'sachets/bottles',
        rewardXp: 150,
        completed: false,
        bloodTypeRecommendation: 'Maintains optimal blood viscosity and nutrient transport for all blood groups.',
      },
      {
        id: 'chal-2',
        title: 'Iron Blood Booster',
        description: 'Accumulate 100mg of dietary iron across wholesome meals this month.',
        category: 'iron',
        targetValue: 100,
        currentValue: 13.8,
        unit: 'mg Iron',
        rewardXp: 120,
        completed: false,
        bloodTypeRecommendation: 'Crucial for Blood Type O and active individuals to maintain peak oxygen transport.',
      },
      {
        id: 'chal-3',
        title: 'Thrifty Protein Master',
        description: 'Reach 1,500g of total protein while keeping average meal cost under $6.00.',
        category: 'protein',
        targetValue: 1500,
        currentValue: 85,
        unit: 'g Protein',
        rewardXp: 200,
        completed: false,
        bloodTypeRecommendation: 'Supports lean muscle recovery and satiety without breaking your budget.',
      },
      {
        id: 'chal-4',
        title: 'Budget Guardian',
        description: 'Keep your monthly spending trajectory comfortably within your set food allowance.',
        category: 'budget',
        targetValue: 100,
        currentValue: 95,
        unit: '% efficiency',
        rewardXp: 100,
        completed: false,
        bloodTypeRecommendation: 'Smart food choices save money and boost mental wellbeing!',
      },
    ],
  };
}

function loadDB(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading DB file, using default DB:', err);
  }
  const defaultDb = getDefaultDB();
  saveDB(defaultDb);
  return defaultDb;
}

function saveDB(data: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB:', err);
  }
}

// In-memory cache synced with disk
let db: DatabaseSchema = loadDB();

// Blood Type nutrition guidelines helper
function getBloodTypeInsight(bloodGroup: string, foodName: string): string {
  const bg = bloodGroup.toUpperCase();
  if (bg.includes('O')) {
    return 'Blood Type O thrives on high-protein lean meats, poultry, fish, and greens; minimizes refined grains for steady energy.';
  } else if (bg.includes('A')) {
    return 'Blood Type A excels with plant-rich diets, legumes, whole grains, and antioxidant-rich berries.';
  } else if (bg.includes('B')) {
    return 'Blood Type B benefits from balanced variety: eggs, quality dairy, greens, and nutrient-dense broths.';
  } else if (bg.includes('AB')) {
    return 'Blood Type AB thrives on balanced seafood, tofu, greens, and alkaline fruits.';
  }
  return 'Balanced nutrient profile supports vibrant metabolic health and sustained daily stamina.';
}

// --- API ROUTES ---

// 1. User Profile
app.get('/api/profile', (req, res) => {
  res.json({ success: true, profile: db.profile });
});

app.post('/api/profile', (req, res) => {
  const updates = req.body;
  db.profile = {
    ...db.profile,
    ...updates,
  };
  saveDB(db);
  res.json({ success: true, profile: db.profile });
});

// 2. Monthly Goals (Monthly amount spent, calories, nutrients, water)
app.get('/api/monthly-goals/:monthKey', (req, res) => {
  const { monthKey } = req.params;
  const goal = db.monthlyGoals[monthKey] || {
    monthKey,
    foodBudget: 300,
    targetCalories: 60000,
    targetProtein: 3000,
    targetCarbs: 7500,
    targetFat: 2000,
    targetFiber: 900,
    targetWaterLiters: 75,
    notes: '',
    updatedAt: new Date().toISOString(),
  };
  res.json({ success: true, goal });
});

app.post('/api/monthly-goals', (req, res) => {
  const {
    monthKey,
    foodBudget,
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat,
    targetFiber,
    targetWaterLiters,
    notes,
  } = req.body;

  if (!monthKey) {
    return res.status(400).json({ success: false, error: 'Month key is required' });
  }

  const updatedGoal: MonthlyGoal = {
    monthKey,
    foodBudget: Number(foodBudget) || 300,
    targetCalories: Number(targetCalories) || 60000,
    targetProtein: Number(targetProtein) || 3000,
    targetCarbs: Number(targetCarbs) || 7500,
    targetFat: Number(targetFat) || 2000,
    targetFiber: Number(targetFiber) || 900,
    targetWaterLiters: Number(targetWaterLiters) || 75,
    notes: notes || '',
    updatedAt: new Date().toISOString(),
  };

  db.monthlyGoals[monthKey] = updatedGoal;
  // Give user XP for goal setting!
  db.profile.xp += 30;
  saveDB(db);

  res.json({ success: true, goal: updatedGoal, profile: db.profile });
});

// 3. Meals
app.get('/api/meals', (req, res) => {
  const monthKey = (req.query.month as string) || new Date().toISOString().slice(0, 7);
  const filteredMeals = db.meals
    .filter((m) => m.monthKey === monthKey)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json({ success: true, meals: filteredMeals });
});

app.post('/api/meals', (req, res) => {
  try {
    const {
      monthKey,
      timestamp,
      foodName,
      portionDescription,
      mealType,
      amountSpent,
      imageUrl,
      nutrients,
      waterLogged,
      healthScore,
      bloodTypeTip,
      mascotCheer,
    } = req.body;

    const newMeal: MealEntry = {
      id: 'meal-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      monthKey: monthKey || new Date().toISOString().slice(0, 7),
      timestamp: timestamp || new Date().toISOString(),
      foodName: foodName || 'Nutritious Meal',
      portionDescription: portionDescription || '1 regular serving',
      mealType: mealType || 'lunch',
      amountSpent: Number(amountSpent) || 0,
      imageUrl: imageUrl || '',
      nutrients: {
        calories: Number(nutrients?.calories) || 450,
        protein: Number(nutrients?.protein) || 20,
        carbs: Number(nutrients?.carbs) || 50,
        fat: Number(nutrients?.fat) || 15,
        fiber: Number(nutrients?.fiber) || 6,
        ironMg: Number(nutrients?.ironMg) || 3,
        calciumMg: Number(nutrients?.calciumMg) || 80,
        vitaminCMg: Number(nutrients?.vitaminCMg) || 25,
        vitaminAIu: Number(nutrients?.vitaminAIu) || 500,
        sodiumMg: Number(nutrients?.sodiumMg) || 400,
      },
      waterLogged: {
        bottles: Number(waterLogged?.bottles) || 0,
        sachets: Number(waterLogged?.sachets) || 0,
        bottleVolumeMl: Number(waterLogged?.bottleVolumeMl) || 750,
        sachetVolumeMl: Number(waterLogged?.sachetVolumeMl) || 500,
        totalLiters:
          Number(waterLogged?.totalLiters) ||
          ((Number(waterLogged?.bottles) || 0) * 0.75 + (Number(waterLogged?.sachets) || 0) * 0.5),
      },
      healthScore: healthScore || 'A',
      bloodTypeTip:
        bloodTypeTip ||
        getBloodTypeInsight(db.profile.bloodGroup, foodName || 'wholesome meal'),
      mascotCheer:
        mascotCheer ||
        'Awesome log! Every bite and sip gets you closer to your monthly health crown! 🦉🎉',
    };

    db.meals.unshift(newMeal);

    // Update challenges progress
    const totalWaterPacks = (newMeal.waterLogged.bottles || 0) + (newMeal.waterLogged.sachets || 0);
    const ironGained = newMeal.nutrients.ironMg || 0;
    const proteinGained = newMeal.nutrients.protein || 0;

    db.challenges.forEach((chal) => {
      if (chal.category === 'hydration') {
        chal.currentValue += totalWaterPacks;
        if (chal.currentValue >= chal.targetValue && !chal.completed) {
          chal.completed = true;
          db.profile.xp += chal.rewardXp;
        }
      } else if (chal.category === 'iron') {
        chal.currentValue = Number((chal.currentValue + ironGained).toFixed(1));
        if (chal.currentValue >= chal.targetValue && !chal.completed) {
          chal.completed = true;
          db.profile.xp += chal.rewardXp;
        }
      } else if (chal.category === 'protein') {
        chal.currentValue = Number((chal.currentValue + proteinGained).toFixed(1));
        if (chal.currentValue >= chal.targetValue && !chal.completed) {
          chal.completed = true;
          db.profile.xp += chal.rewardXp;
        }
      }
    });

    // Add XP to profile
    db.profile.xp += 25;
    if (db.profile.xp >= db.profile.level * 200) {
      db.profile.level += 1;
    }

    saveDB(db);

    res.json({
      success: true,
      meal: newMeal,
      profile: db.profile,
      challenges: db.challenges,
    });
  } catch (err: any) {
    console.error('Error adding meal:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/meals/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = db.meals.length;
  db.meals = db.meals.filter((m) => m.id !== id);

  if (db.meals.length !== initialLength) {
    saveDB(db);
    return res.json({ success: true, message: 'Meal deleted' });
  }
  res.status(404).json({ success: false, error: 'Meal not found' });
});

// 4. Quick Water Logger (when drinking water between meals)
app.post('/api/water', (req, res) => {
  const { bottles, sachets, bottleVolumeMl = 750, sachetVolumeMl = 500 } = req.body;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const b = Number(bottles) || 0;
  const s = Number(sachets) || 0;
  const totalLiters = (b * bottleVolumeMl + s * sachetVolumeMl) / 1000;

  if (totalLiters <= 0) {
    return res.status(400).json({ success: false, error: 'Water amount must be greater than 0' });
  }

  const waterEntry: MealEntry = {
    id: 'water-' + Date.now(),
    monthKey: currentMonth,
    timestamp: new Date().toISOString(),
    foodName: 'Pure Refreshing Water',
    portionDescription: `${b > 0 ? `${b} bottle(s)` : ''} ${s > 0 ? `${s} sachet(s)` : ''}`.trim(),
    mealType: 'snack',
    amountSpent: 0,
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80',
    nutrients: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      ironMg: 0,
      calciumMg: 15,
      vitaminCMg: 0,
      vitaminAIu: 0,
      sodiumMg: 5,
    },
    waterLogged: {
      bottles: b,
      sachets: s,
      bottleVolumeMl,
      sachetVolumeMl,
      totalLiters,
    },
    healthScore: 'A+',
    bloodTypeTip: 'Optimal hydration keeps red blood cell membranes flexible and cellular energy high.',
    mascotCheer: 'Gulp gulp! Hydration power unlocked! 💧🦉',
  };

  db.meals.unshift(waterEntry);
  db.profile.xp += 15;

  db.challenges.forEach((chal) => {
    if (chal.category === 'hydration') {
      chal.currentValue += b + s;
      if (chal.currentValue >= chal.targetValue && !chal.completed) {
        chal.completed = true;
        db.profile.xp += chal.rewardXp;
      }
    }
  });

  saveDB(db);
  res.json({ success: true, meal: waterEntry, profile: db.profile, challenges: db.challenges });
});

// 5. Challenges
app.get('/api/challenges', (req, res) => {
  res.json({ success: true, challenges: db.challenges });
});

// Helper to get active Gemini SDK client
function getAiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  try {
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
    return null;
  }
}

// 6. AI Food Analysis (Image + Food description + User Profile context)
app.post('/api/analyze-food', async (req, res) => {
  const { imageBase64, foodHint, amountSpent } = req.body;
  const userBloodGroup = db.profile.bloodGroup || 'O+';
  const userAge = db.profile.age || 25;
  const userSex = db.profile.sex || 'female';
  const userWeight = db.profile.weight || 68;

  const client = getAiClient();

  // If Gemini API is available, perform real multimodal vision analysis
  if (client && imageBase64) {
    // Extract base64 and mimeType
    const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    let mimeType = 'image/jpeg';
    const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z0-9\+\-]+);base64,/);
    if (mimeMatch && mimeMatch[1]) {
      mimeType = mimeMatch[1];
    }

    const prompt = `You are NutriBuddy, an expert nutritional scientist and supportive Duolingo-style health coach.
Analyze this food image. The user is a ${userAge} year old ${userSex}, weight ${userWeight}kg, blood group ${userBloodGroup}.
Food hint / notes provided: "${foodHint || 'none'}".
Amount spent on this meal: "${amountSpent || 'not specified'}".

Provide a precise JSON analysis of this meal including:
1. "foodName": exact dish name or foods in picture (e.g., "Jollof Rice with Fried Plantain and Grilled Chicken")
2. "portionDescription": estimated portion size (e.g., "1 large plate (~450g)")
3. "calories": estimated total calories (number)
4. "protein": grams of protein (number)
5. "carbs": grams of carbohydrates (number)
6. "fat": grams of fat (number)
7. "fiber": grams of dietary fiber (number)
8. "ironMg": milligrams of iron (number)
9. "calciumMg": milligrams of calcium (number)
10. "vitaminCMg": milligrams of vitamin C (number)
11. "vitaminAIu": IU of vitamin A (number)
12. "sodiumMg": milligrams of sodium (number)
13. "healthScore": letter grade ('A+', 'A', 'B', 'C', 'D')
14. "bloodTypeTip": 1-2 practical sentences explaining how this specific meal interacts with Blood Group ${userBloodGroup}.
15. "mascotCheer": A lively, punchy Duolingo-style cheer encouraging the user, mentioning their macros or budget!

Respond strictly with valid JSON. No markdown code blocks, just raw JSON.`;

    // Try models in order of quota availability
    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];

    for (const modelName of modelsToTry) {
      try {
        const response = await client.models.generateContent({
          model: modelName,
          contents: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            { text: prompt },
          ],
          config: {
            responseMimeType: 'application/json',
          },
        });

        const responseText = response.text || '';
        let cleanJson = responseText.trim();
        if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
        }
        const parsed = JSON.parse(cleanJson);
        console.log(`Successfully analyzed image with model: ${modelName}`);
        return res.json({ success: true, analysis: parsed, source: 'gemini-vision', modelUsed: modelName });
      } catch (err: any) {
        console.warn(`Gemini vision attempt with ${modelName} failed:`, err?.message || err);
      }
    }
  }

  // Fallback intelligent nutritional estimation based on hint/keywords & standard culinary database
  const hintLower = (foodHint || '').toLowerCase();
  let estimatedName = foodHint || 'Balanced Nutrient Plate';
  let cal = 480;
  let prot = 24;
  let carbs = 52;
  let fat = 16;
  let fiber = 7;
  let iron = 3.8;
  let vitC = 30;
  let calcium = 120;
  let score: 'A+' | 'A' | 'B' | 'C' = 'A';

  if (hintLower.includes('chicken') || hintLower.includes('poultry') || hintLower.includes('turkey')) {
    estimatedName = foodHint || 'Herb Roasted Chicken Breast with Greens';
    cal = 540;
    prot = 46;
    carbs = 35;
    fat = 15;
    iron = 3.5;
    score = 'A+';
  } else if (hintLower.includes('fish') || hintLower.includes('salmon') || hintLower.includes('tilapia')) {
    estimatedName = foodHint || 'Pan-Seared Fish with Steamed Vegetables';
    cal = 460;
    prot = 38;
    carbs = 28;
    fat = 18;
    iron = 2.4;
    vitC = 40;
    score = 'A+';
  } else if (hintLower.includes('rice') || hintLower.includes('jollof') || hintLower.includes('fried rice')) {
    estimatedName = foodHint || 'Flavorful Jollof Rice with Vegetables';
    cal = 580;
    prot = 18;
    carbs = 88;
    fat = 14;
    fiber = 6;
    iron = 4.1;
    score = 'A';
  } else if (hintLower.includes('egg') || hintLower.includes('toast') || hintLower.includes('breakfast')) {
    estimatedName = foodHint || 'Farm Fresh Eggs with Whole Grain Toast';
    cal = 410;
    prot = 22;
    carbs = 32;
    fat = 20;
    iron = 2.9;
    score = 'A';
  } else if (hintLower.includes('salad') || hintLower.includes('spinach') || hintLower.includes('greens')) {
    estimatedName = foodHint || 'Supergreen Protein Salad';
    cal = 340;
    prot = 16;
    carbs = 24;
    fat = 18;
    fiber = 11;
    iron = 5.2;
    vitC = 65;
    score = 'A+';
  } else if (hintLower.includes('bean') || hintLower.includes('lentil') || hintLower.includes('stew')) {
    estimatedName = foodHint || 'Savory Bean Stew with Plantains';
    cal = 510;
    prot = 26;
    carbs = 76;
    fat = 9;
    fiber = 15;
    iron = 6.4;
    score = 'A+';
  }

  const bloodTip = getBloodTypeInsight(userBloodGroup, estimatedName);
  const mascotCheers = [
    `Super meal logged! You conquered ${prot}g of protein and fed your daily engine! 🦉🔥`,
    `Way to go! Nutrient power unlocked for Blood Type ${userBloodGroup}! 🌟`,
    `Budget and health in harmony! High five from NutriBuddy! 🦉🥑`,
  ];

  return res.json({
    success: true,
    analysis: {
      foodName: estimatedName,
      portionDescription: 'Standard balanced portion (~380g)',
      calories: cal,
      protein: prot,
      carbs: carbs,
      fat,
      fiber,
      ironMg: iron,
      calciumMg: calcium,
      vitaminCMg: vitC,
      vitaminAIu: 650,
      sodiumMg: 380,
      healthScore: score,
      bloodTypeTip: bloodTip,
      mascotCheer: mascotCheers[Math.floor(Math.random() * mascotCheers.length)],
    },
    source: 'smart-heuristic',
  });
});

// 7. AI Food & Nutrient Recommendations tailored to Blood Group, Budget, and Health Challenge
app.post('/api/recommend-foods', async (req, res) => {
  const { challengeCategory, targetBudgetRemaining } = req.body;
  const user = db.profile;
  const currency = user.currency || '$';

  const client = getAiClient();

  // If Gemini client available, generate fresh creative contextual recommendations
  if (client) {
    const prompt = `You are NutriBuddy, a Duolingo-styled lively nutrition coach.
The user profile is:
- Age: ${user.age}
- Sex: ${user.sex}
- Weight: ${user.weight}kg
- Blood Group: ${user.bloodGroup}
- Active Challenge Category: ${challengeCategory || 'overall-health'}
- Remaining Food Budget for the month: ${currency}${targetBudgetRemaining || 150}

Generate 4 high-nutrient, cost-effective meal suggestions tailored specifically to their blood group (${user.bloodGroup}) and the challenge (${challengeCategory}).
Ensure the meals are economical and pack maximum calories & micro/macronutrients per currency unit spent.

Return a JSON array of 4 objects with:
- "mealName": string
- "costEstimate": number (in local currency value)
- "calories": number
- "protein": number (grams)
- "keyNutrients": string (e.g. "Iron: 5.5mg, Vit C: 45mg")
- "bloodGroupAdvantage": string (how it specifically benefits Blood Group ${user.bloodGroup})
- "duoTip": string (playful tip to prepare or buy cheaply)

Return strictly JSON array.`;

    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];

    for (const modelName of modelsToTry) {
      try {
        const response = await client.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const responseText = response.text || '';
        let cleanJson = responseText.trim();
        if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
        }
        const parsed = JSON.parse(cleanJson);
        return res.json({ success: true, recommendations: parsed, modelUsed: modelName });
      } catch (err: any) {
        console.warn(`Gemini recommend-foods with ${modelName} failed:`, err?.message || err);
      }
    }
  }

  // Curated database tailored to blood group and challenges
  const bloodType = user.bloodGroup || 'O+';
  const recommendations = [
    {
      mealName: bloodType.includes('O')
        ? 'Skillet Beef & Spinach with Garlic Quinoa'
        : 'Spiced Black Bean & Sweet Potato Hash with Pumpkin Seeds',
      costEstimate: 3.50,
      calories: 520,
      protein: bloodType.includes('O') ? 38 : 26,
      keyNutrients: 'Iron: 6.2mg, Potassium: 820mg, Fiber: 12g',
      bloodGroupAdvantage: bloodType.includes('O')
        ? 'High bioavailable heme iron and lean protein match Type O stomach acidity for maximum digestion.'
        : 'Plant-based polyphenols and complex carbs nurture beneficial gut flora for Type A & B.',
      duoTip: 'Buy seasonal spinach in bunches and batch-cook grains on Sunday for massive savings! 🦉💰',
    },
    {
      mealName: 'Citrus Lentil Salad with Boiled Eggs & Crushed Walnuts',
      costEstimate: 2.80,
      calories: 460,
      protein: 28,
      keyNutrients: 'Iron: 5.4mg, Vitamin C: 50mg, Folate: 210mcg',
      bloodGroupAdvantage: 'Vitamin C from fresh citrus quadruples non-heme iron absorption in the intestines!',
      duoTip: 'Dry lentils cost pennies per serving and boast 9g of fiber per cup! 🍋',
    },
    {
      mealName: 'Grilled Mackerel or Sardine Toast with Sliced Tomato & Olive Oil',
      costEstimate: 3.10,
      calories: 480,
      protein: 32,
      keyNutrients: 'Omega-3 EPA/DHA: 1800mg, Calcium: 280mg, Vit D: 400IU',
      bloodGroupAdvantage: 'High anti-inflammatory omega-3 fatty acids optimize cardiovascular flow and joint flexibility.',
      duoTip: 'Canned sardines or mackerel in water pack premium ocean nutrition at a fraction of salmon cost! 🐟',
    },
    {
      mealName: 'Nutrient-Dense Banana Peanut Oat Power Bowl with Chia Seeds',
      costEstimate: 1.90,
      calories: 510,
      protein: 20,
      keyNutrients: 'Magnesium: 140mg, Healthy Fats: 22g, Fiber: 10g',
      bloodGroupAdvantage: 'Clean sustained energy burn without insulin spikes, perfect for morning mental focus.',
      duoTip: 'Peanut butter + oats is the undisputed budget champion of world nutrition! 🥜⚡',
    },
  ];

  res.json({ success: true, recommendations });
});

// 8. Monthly Summary / Dashboard Analytics
app.get('/api/dashboard/:monthKey', (req, res) => {
  const { monthKey } = req.params;
  const goal = db.monthlyGoals[monthKey] || {
    monthKey,
    foodBudget: 300,
    targetCalories: 60000,
    targetProtein: 3000,
    targetCarbs: 7500,
    targetFat: 2000,
    targetFiber: 900,
    targetWaterLiters: 75,
    notes: '',
    updatedAt: new Date().toISOString(),
  };

  const monthMeals = db.meals.filter((m) => m.monthKey === monthKey);

  // Compute aggregates
  let totalSpent = 0;
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let totalIronMg = 0;
  let totalCalciumMg = 0;
  let totalVitaminCMg = 0;

  let totalWaterLiters = 0;
  let totalBottles = 0;
  let totalSachets = 0;

  monthMeals.forEach((meal) => {
    totalSpent += meal.amountSpent || 0;
    totalCalories += meal.nutrients?.calories || 0;
    totalProtein += meal.nutrients?.protein || 0;
    totalCarbs += meal.nutrients?.carbs || 0;
    totalFat += meal.nutrients?.fat || 0;
    totalFiber += meal.nutrients?.fiber || 0;
    totalIronMg += meal.nutrients?.ironMg || 0;
    totalCalciumMg += meal.nutrients?.calciumMg || 0;
    totalVitaminCMg += meal.nutrients?.vitaminCMg || 0;

    totalWaterLiters += meal.waterLogged?.totalLiters || 0;
    totalBottles += meal.waterLogged?.bottles || 0;
    totalSachets += meal.waterLogged?.sachets || 0;
  });

  const remainingBudget = Math.max(0, goal.foodBudget - totalSpent);
  const budgetPercentUsed = goal.foodBudget > 0 ? (totalSpent / goal.foodBudget) * 100 : 0;
  const caloriePercentAchieved = goal.targetCalories > 0 ? (totalCalories / goal.targetCalories) * 100 : 0;
  const waterPercentAchieved = goal.targetWaterLiters > 0 ? (totalWaterLiters / goal.targetWaterLiters) * 100 : 0;
  const proteinPercentAchieved = goal.targetProtein > 0 ? (totalProtein / goal.targetProtein) * 100 : 0;

  // Cost efficiency metrics
  const costPer1000Kcal = totalCalories > 0 ? (totalSpent / (totalCalories / 1000)) : 0;
  const costPer100gProtein = totalProtein > 0 ? (totalSpent / (totalProtein / 100)) : 0;

  // Duolingo-style Health Mastery Score
  let scorePoints = 0;
  if (caloriePercentAchieved >= 80 && caloriePercentAchieved <= 120) scorePoints += 25;
  if (budgetPercentUsed <= 100) scorePoints += 30;
  if (waterPercentAchieved >= 70) scorePoints += 25;
  if (proteinPercentAchieved >= 75) scorePoints += 20;

  let masteryBadge = 'Nutri-Novice';
  if (scorePoints >= 90) masteryBadge = 'Grandmaster Owl 🦉👑';
  else if (scorePoints >= 70) masteryBadge = 'Nutrition Champion 🌟';
  else if (scorePoints >= 50) masteryBadge = 'Healthy Explorer 🥗';

  res.json({
    success: true,
    monthKey,
    goal,
    profile: db.profile,
    totals: {
      mealsCount: monthMeals.length,
      totalSpent: Number(totalSpent.toFixed(2)),
      remainingBudget: Number(remainingBudget.toFixed(2)),
      budgetPercentUsed: Number(budgetPercentUsed.toFixed(1)),
      totalCalories: Math.round(totalCalories),
      caloriePercentAchieved: Number(caloriePercentAchieved.toFixed(1)),
      totalProtein: Math.round(totalProtein),
      proteinPercentAchieved: Number(proteinPercentAchieved.toFixed(1)),
      totalCarbs: Math.round(totalCarbs),
      totalFat: Math.round(totalFat),
      totalFiber: Math.round(totalFiber),
      totalIronMg: Number(totalIronMg.toFixed(1)),
      totalCalciumMg: Math.round(totalCalciumMg),
      totalVitaminCMg: Math.round(totalVitaminCMg),
      totalWaterLiters: Number(totalWaterLiters.toFixed(2)),
      totalBottles,
      totalSachets,
      waterPercentAchieved: Number(waterPercentAchieved.toFixed(1)),
      costPer1000Kcal: Number(costPer1000Kcal.toFixed(2)),
      costPer100gProtein: Number(costPer100gProtein.toFixed(2)),
      healthMasteryScore: scorePoints,
      masteryBadge,
    },
    recentMeals: monthMeals.slice(0, 10),
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`NutriDuo server running on http://localhost:${PORT}`);
  });
}

startServer();
