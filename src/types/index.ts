export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Sex = 'male' | 'female' | 'other';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface UserProfile {
  name: string;
  age: number;
  weight: number; // in kg
  sex: Sex;
  bloodGroup: BloodGroup;
  currency: string;
  activityLevel: 'sedentary' | 'moderate' | 'active';
  dietPreference: string;
  streakDays: number;
  xp: number;
  level: number;
  onboardingComplete: boolean;
}

export interface MonthlyGoal {
  monthKey: string;
  foodBudget: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetFiber: number;
  targetWaterLiters: number;
  notes?: string;
  updatedAt: string;
}

export interface MealNutrients {
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

export interface MealWater {
  bottles: number;
  sachets: number;
  bottleVolumeMl: number;
  sachetVolumeMl: number;
  totalLiters: number;
}

export interface MealEntry {
  id: string;
  monthKey: string;
  timestamp: string;
  foodName: string;
  portionDescription: string;
  mealType: MealType;
  amountSpent: number;
  imageUrl?: string;
  nutrients: MealNutrients;
  waterLogged: MealWater;
  healthScore: 'A+' | 'A' | 'B' | 'C' | 'D';
  bloodTypeTip: string;
  mascotCheer: string;
}

export interface HealthChallenge {
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

export interface DashboardTotals {
  mealsCount: number;
  totalSpent: number;
  remainingBudget: number;
  budgetPercentUsed: number;
  totalCalories: number;
  caloriePercentAchieved: number;
  totalProtein: number;
  proteinPercentAchieved: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalIronMg: number;
  totalCalciumMg: number;
  totalVitaminCMg: number;
  totalWaterLiters: number;
  totalBottles: number;
  totalSachets: number;
  waterPercentAchieved: number;
  costPer1000Kcal: number;
  costPer100gProtein: number;
  healthMasteryScore: number;
  masteryBadge: string;
}

export interface DashboardResponse {
  success: boolean;
  monthKey: string;
  goal: MonthlyGoal;
  profile: UserProfile;
  totals: DashboardTotals;
  recentMeals: MealEntry[];
}

export interface FoodRecommendation {
  mealName: string;
  costEstimate: number;
  calories: number;
  protein: number;
  keyNutrients: string;
  bloodGroupAdvantage: string;
  duoTip: string;
}
