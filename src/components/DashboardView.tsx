import React, { useState } from 'react';
import {
  DashboardResponse,
  UserProfile,
  MonthlyGoal,
  MealEntry,
  HealthChallenge,
  FoodRecommendation,
} from '../types';
import { MascotOwl } from './MascotOwl';
import { sounds } from '../utils/audio';
import {
  Flame,
  Droplets,
  DollarSign,
  Trophy,
  Plus,
  Utensils,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Volume2,
  VolumeX,
  Heart,
  Edit3,
  Trash2,
  PieChart,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Zap,
} from 'lucide-react';

interface DashboardViewProps {
  data: DashboardResponse;
  profile: UserProfile;
  monthKey: string;
  onMonthChange: (newMonth: string) => void;
  onOpenUploadMeal: () => void;
  onOpenQuickWater: () => void;
  onOpenMonthlyGoal: () => void;
  onOpenChallenges: () => void;
  onOpenProfile: () => void;
  onDeleteMeal: (mealId: string) => Promise<void>;
  onQuickLogRecommendation?: (rec: FoodRecommendation) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  profile,
  monthKey,
  onMonthChange,
  onOpenUploadMeal,
  onOpenQuickWater,
  onOpenMonthlyGoal,
  onOpenChallenges,
  onOpenProfile,
  onDeleteMeal,
}) => {
  const [soundOn, setSoundOn] = useState(sounds.isEnabled());
  const [mealFilter, setMealFilter] = useState<'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack'>('all');

  const { totals, goal, recentMeals } = data;
  const currency = profile.currency || '$';

  // Format month for display
  const [year, month] = monthKey.split('-');
  const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  const formattedMonth = dateObj.toLocaleDateString('default', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    sounds.playPop();
    const curr = new Date(parseInt(year, 10), parseInt(month, 10) - 2, 1);
    const mStr = String(curr.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${curr.getFullYear()}-${mStr}`);
  };

  const handleNextMonth = () => {
    sounds.playPop();
    const curr = new Date(parseInt(year, 10), parseInt(month, 10), 1);
    const mStr = String(curr.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${curr.getFullYear()}-${mStr}`);
  };

  const toggleSound = () => {
    const nextState = !soundOn;
    sounds.setEnabled(nextState);
    setSoundOn(nextState);
    if (nextState) sounds.playPop();
  };

  const filteredMeals = recentMeals.filter((m) =>
    mealFilter === 'all' ? true : m.mealType === mealFilter
  );

  // Remaining budget color status
  const budgetSafe = totals.totalSpent <= goal.foodBudget;
  const budgetRatio = goal.foodBudget > 0 ? totals.totalSpent / goal.foodBudget : 0;
  const budgetColor =
    budgetRatio > 1 ? 'text-[#ff4b4b]' : budgetRatio > 0.8 ? 'text-[#ff9600]' : 'text-[#58cc02]';

  return (
    <div className="min-h-screen bg-[#f7f9fa] pb-16">
      {/* Top Duo Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b-2 border-gray-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-18 flex items-center justify-between gap-3">
          {/* Logo & Mascot */}
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-[#58cc02] border-2 border-[#46a302] border-b-4 flex items-center justify-center text-white shadow-xs">
              <span className="font-fun font-bold text-2xl">🦉</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-fun font-bold text-xl text-[#58cc02] tracking-tight">
                  NutriDuo
                </span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-green-100 text-[#2b7200]">
                  Gemma AI
                </span>
              </div>
              <p className="text-[11px] font-semibold text-gray-400 -mt-1 hidden sm:block">
                Budget & Nutrient Master
              </p>
            </div>
          </div>

          {/* Gamification Stats: Streak, XP, Blood Type, Sound */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-orange-50 border-2 border-orange-200 border-b-4 text-orange-600 font-fun font-bold text-sm cursor-default"
              title="Daily Healthy Streak"
            >
              <Flame className="w-4 h-4 text-[#ff9600] fill-[#ff9600] animate-bounce" />
              <span>{profile.streakDays || 5}</span>
            </div>

            {/* Level & XP */}
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-50 border-2 border-amber-200 border-b-4 text-amber-700 font-bold text-xs"
              title="Your Health Mastery Level"
            >
              <Trophy className="w-4 h-4 text-[#ffc800] fill-[#ffc800]" />
              <span>Lvl {profile.level}</span>
              <span className="text-gray-300">•</span>
              <span className="text-amber-800">{profile.xp} XP</span>
            </div>

            {/* Blood Type Badge */}
            <button
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-rose-50 border-2 border-rose-200 border-b-4 text-rose-700 font-fun font-bold text-xs hover:bg-rose-100 transition-all duo-btn"
              title="Your Blood Group Profile"
            >
              <Heart className="w-3.5 h-3.5 text-[#ff4b4b] fill-[#ff4b4b]" />
              <span>{profile.bloodGroup}</span>
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className="p-2 rounded-2xl border-2 border-gray-200 border-b-4 text-gray-500 hover:bg-gray-50 transition-all duo-btn"
              title={soundOn ? 'Sound effects active' : 'Sound effects muted'}
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-[#58cc02]" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* User Profile */}
            <button
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl border-2 border-gray-200 border-b-4 hover:border-gray-300 transition-all duo-btn"
            >
              <div className="w-7 h-7 rounded-full bg-[#1cb0f6] text-white flex items-center justify-center font-bold text-xs">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-xs font-bold text-gray-700 hidden md:inline">
                {profile.name.split(' ')[0]}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Month Selector & Quick Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border-2 border-gray-200 border-b-4 shadow-xs">
          {/* Month Nav */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 p-1 rounded-2xl border border-gray-200">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 rounded-xl text-gray-600 hover:bg-white transition-all duo-btn"
                title="Previous Month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="px-4 py-1 flex items-center gap-2 font-fun font-bold text-lg text-gray-800 select-none">
                <Calendar className="w-4 h-4 text-[#1cb0f6]" />
                <span>{formattedMonth}</span>
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-xl text-gray-600 hover:bg-white transition-all duo-btn"
                title="Next Month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenMonthlyGoal}
              className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-2xl border-2 border-emerald-200 border-b-4 flex items-center gap-1.5 transition-all duo-btn"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#58cc02]" />
              <span className="hidden sm:inline">Upload / Edit Goals via Textbox</span>
              <span className="sm:hidden">Goals Textbox</span>
            </button>
          </div>

          {/* Action Buttons: Log Food & Spending, Quick Water, Challenges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenUploadMeal}
              className="px-5 py-3 rounded-2xl font-bold text-white bg-[#58cc02] border-2 border-[#46a302] border-b-4 hover:bg-[#61e002] transition-all duo-btn shadow-xs flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Log Food & Spend</span>
            </button>

            <button
              type="button"
              onClick={onOpenQuickWater}
              className="px-4 py-3 rounded-2xl font-bold text-white bg-[#1cb0f6] border-2 border-[#1899d6] border-b-4 hover:bg-[#2bbafc] transition-all duo-btn shadow-xs flex items-center gap-2 text-sm"
            >
              <Droplets className="w-4 h-4 fill-white" />
              <span>+ Water</span>
            </button>

            <button
              type="button"
              onClick={onOpenChallenges}
              className="px-4 py-3 rounded-2xl font-bold text-[#4b3600] bg-[#ffc800] border-2 border-[#e5a500] border-b-4 hover:bg-[#ffd124] transition-all duo-btn shadow-xs flex items-center gap-2 text-sm"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Health Challenges</span>
              <span className="sm:hidden">Quests</span>
            </button>
          </div>
        </div>

        {/* Mascot Motivational Speech Banner */}
        <div className="bg-linear-to-r from-[#eafbe1] to-[#e4f6ff] border-2 border-[#bae6bd] border-b-4 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <MascotOwl
              mood="cheering"
              size="md"
              speech={`Hey ${profile.name.split(' ')[0]}! You've logged ${totals.mealsCount} meals this month. Water level is at ${totals.totalWaterLiters}L!`}
            />
          </div>

          <div className="hidden lg:flex flex-col items-end text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Nutri-Mastery Score
            </span>
            <div className="font-fun font-bold text-2xl text-[#2b7200]">
              {totals.masteryBadge}
            </div>
            <span className="text-xs font-semibold text-gray-500">
              {totals.healthMasteryScore}/100 Monthly Health Index
            </span>
          </div>
        </div>

        {/* 4 Primary Hero Cards: Budget, Calories, Water, Nutrients */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CARD 1: Monthly Food Budget Tracker */}
          <div className="bg-white p-5 rounded-3xl border-2 border-gray-200 border-b-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-[#58cc02]" />
                  Food Budget
                </span>
                <button
                  type="button"
                  onClick={onOpenMonthlyGoal}
                  className="text-[11px] font-bold text-gray-400 hover:text-[#58cc02] transition-colors"
                  title="Edit Budget in Textbox"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-baseline gap-1.5 mb-1">
                <span className={`font-fun font-extrabold text-3xl ${budgetColor}`}>
                  {currency}{totals.totalSpent.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-gray-400">
                  / {currency}{goal.foodBudget.toLocaleString()}
                </span>
              </div>

              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mb-2 border border-gray-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    budgetRatio > 1
                      ? 'bg-[#ff4b4b]'
                      : budgetRatio > 0.8
                      ? 'bg-[#ff9600]'
                      : 'bg-[#58cc02]'
                  }`}
                  style={{ width: `${Math.min(100, totals.budgetPercentUsed)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                <span>{totals.budgetPercentUsed}% used</span>
                <span className={budgetSafe ? 'text-green-600' : 'text-red-500'}>
                  {budgetSafe
                    ? `${currency}${totals.remainingBudget.toLocaleString()} left`
                    : `Over by ${currency}${Math.abs(goal.foodBudget - totals.totalSpent).toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-semibold">
              <span>Cost / 1,000 kcal:</span>
              <span className="font-bold text-gray-800">{currency}{totals.costPer1000Kcal}</span>
            </div>
          </div>

          {/* CARD 2: Monthly Calories Achieved */}
          <div className="bg-white p-5 rounded-3xl border-2 border-gray-200 border-b-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#ff9600]" />
                  Calories Gained
                </span>
                <span className="text-[11px] font-bold text-[#ff9600] bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200">
                  {totals.caloriePercentAchieved}%
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="font-fun font-extrabold text-3xl text-orange-600">
                  {totals.totalCalories.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-gray-400">
                  / {goal.targetCalories.toLocaleString()} kcal
                </span>
              </div>

              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mb-2 border border-gray-200">
                <div
                  className="h-full bg-[#ff9600] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, totals.caloriePercentAchieved)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                <span>Daily Avg:</span>
                <span className="text-orange-700">
                  ~{totals.mealsCount > 0 ? Math.round(totals.totalCalories / 30) : 0} kcal / day
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-semibold">
              <span>Target Pace:</span>
              <span className="font-bold text-gray-800">
                ~{Math.round(goal.targetCalories / 30)} kcal / day
              </span>
            </div>
          </div>

          {/* CARD 3: Monthly Water Level (Bottles & Sachets) */}
          <div className="bg-white p-5 rounded-3xl border-2 border-gray-200 border-b-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-[#1cb0f6] fill-[#1cb0f6]" />
                  Water Intake Level
                </span>
                <span className="text-[11px] font-bold text-[#1cb0f6] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                  {totals.waterPercentAchieved}%
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="font-fun font-extrabold text-3xl text-[#1cb0f6]">
                  {totals.totalWaterLiters}
                </span>
                <span className="text-xs font-bold text-gray-400">
                  / {goal.targetWaterLiters} Liters
                </span>
              </div>

              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mb-2 border border-gray-200">
                <div
                  className="h-full bg-[#1cb0f6] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, totals.waterPercentAchieved)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-sky-800">
                <span>💧 {totals.totalSachets} Sachets</span>
                <span>🍾 {totals.totalBottles} Bottles</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-semibold">
              <span>Pure Water Packs:</span>
              <button
                type="button"
                onClick={onOpenQuickWater}
                className="font-bold text-[#1cb0f6] hover:underline"
              >
                + Log Water Now
              </button>
            </div>
          </div>

          {/* CARD 4: Protein & Nutrient Power */}
          <div className="bg-white p-5 rounded-3xl border-2 border-gray-200 border-b-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#ce82ff]" />
                  Protein & Blood Iron
                </span>
                <span className="text-[11px] font-bold text-[#ce82ff] bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
                  {totals.proteinPercentAchieved}%
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="font-fun font-extrabold text-3xl text-purple-700">
                  {totals.totalProtein}g
                </span>
                <span className="text-xs font-bold text-gray-400">
                  / {goal.targetProtein}g Protein
                </span>
              </div>

              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mb-2 border border-gray-200">
                <div
                  className="h-full bg-[#ce82ff] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, totals.proteinPercentAchieved)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                <span className="text-red-700">🩸 Iron: {totals.totalIronMg}mg</span>
                <span className="text-amber-700">🍊 Vit C: {totals.totalVitaminCMg}mg</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-semibold">
              <span>Cost / 100g Protein:</span>
              <span className="font-bold text-gray-800">{currency}{totals.costPer100gProtein}</span>
            </div>
          </div>
        </div>

        {/* Nutritional Breakdown & Blood Group Alignment Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Macro Nutrient Progress Deep Dive */}
          <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border-2 border-gray-200 border-b-4 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-fun font-bold text-xl text-gray-800 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-[#58cc02]" />
                  Nutritional Gain vs Monthly Targets
                </h3>
                <p className="text-xs text-gray-400 font-semibold">
                  Track how your food intake matches your monthly health goals
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenMonthlyGoal}
                className="text-xs font-bold text-[#58cc02] hover:underline"
              >
                Adjust Targets Textbox
              </button>
            </div>

            <div className="space-y-4">
              {/* Protein Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-purple-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ce82ff]" />
                    Protein (Lean Muscle & Cell Repair)
                  </span>
                  <span className="text-gray-600">
                    {totals.totalProtein}g / {goal.targetProtein}g ({totals.proteinPercentAchieved}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden border border-gray-200">
                  <div
                    className="h-full bg-[#ce82ff] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, totals.proteinPercentAchieved)}%` }}
                  />
                </div>
              </div>

              {/* Carbs Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-blue-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1cb0f6]" />
                    Complex Carbohydrates (Daily Brain & Muscle Energy)
                  </span>
                  <span className="text-gray-600">
                    {totals.totalCarbs}g / {goal.targetCarbs}g (
                    {goal.targetCarbs > 0 ? Math.round((totals.totalCarbs / goal.targetCarbs) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden border border-gray-200">
                  <div
                    className="h-full bg-[#1cb0f6] rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        goal.targetCarbs > 0 ? (totals.totalCarbs / goal.targetCarbs) * 100 : 0
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Healthy Fats Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-yellow-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffc800]" />
                    Healthy Fats (Hormone Health & Satiety)
                  </span>
                  <span className="text-gray-600">
                    {totals.totalFat}g / {goal.targetFat}g (
                    {goal.targetFat > 0 ? Math.round((totals.totalFat / goal.targetFat) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden border border-gray-200">
                  <div
                    className="h-full bg-[#ffc800] rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        goal.targetFat > 0 ? (totals.totalFat / goal.targetFat) * 100 : 0
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Dietary Fiber Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-green-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#58cc02]" />
                    Dietary Fiber (Microbiome & Digestion)
                  </span>
                  <span className="text-gray-600">
                    {totals.totalFiber}g / {goal.targetFiber}g (
                    {goal.targetFiber > 0 ? Math.round((totals.totalFiber / goal.targetFiber) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden border border-gray-200">
                  <div
                    className="h-full bg-[#58cc02] rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        goal.targetFiber > 0 ? (totals.totalFiber / goal.targetFiber) * 100 : 0
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Micronutrient Badges */}
            <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-2xl bg-red-50 border border-red-200">
                <span className="text-[10px] font-bold text-red-600 uppercase block">Iron (Blood)</span>
                <span className="font-fun font-bold text-base text-red-900">{totals.totalIronMg} mg</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-600 uppercase block">Vitamin C</span>
                <span className="font-fun font-bold text-base text-amber-900">{totals.totalVitaminCMg} mg</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-600 uppercase block">Calcium</span>
                <span className="font-fun font-bold text-base text-emerald-900">{totals.totalCalciumMg} mg</span>
              </div>
            </div>
          </div>

          {/* Blood Group Biological Intelligence Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-gray-200 border-b-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 border-2 border-[#ff4b4b] flex items-center justify-center text-[#ff4b4b] font-fun font-bold text-lg">
                  {profile.bloodGroup}
                </div>
                <div>
                  <h4 className="font-fun font-bold text-base text-gray-800">
                    Blood Group {profile.bloodGroup} Insights
                  </h4>
                  <p className="text-[11px] font-bold text-rose-600">
                    Calibrated for {profile.age}y {profile.sex}, {profile.weight}kg
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-gray-600 font-medium">
                <div className="p-3 rounded-2xl bg-[#fff5f5] border border-red-200">
                  <strong className="block text-red-900 mb-0.5">Hydration Recommendation:</strong>
                  Drink minimum 2.5 Liters daily (~5 cold sachets or 3-4 bottles) to maintain blood plasma fluid volume.
                </div>

                <div className="p-3 rounded-2xl bg-[#f2faf0] border border-green-200">
                  <strong className="block text-green-900 mb-0.5">Budget Superfoods:</strong>
                  Eggs, dry lentils, sweet potatoes, spinach, sardines, and seasonal local greens give 3x more nutrients per currency unit.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenChallenges}
              className="mt-4 w-full py-3 rounded-2xl font-bold text-xs bg-[#ffc800] border-2 border-[#e5a500] border-b-4 text-[#4b3600] hover:bg-[#ffd124] transition-all duo-btn shadow-xs flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Get AI Food Recommendations</span>
            </button>
          </div>
        </div>

        {/* Recent Logged Meals Section */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-gray-200 border-b-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="font-fun font-bold text-xl text-gray-800 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#ff9600]" />
                Logged Meals & Spending History
              </h3>
              <p className="text-xs text-gray-400 font-semibold">
                Every meal scanned with amount spent and water taken
              </p>
            </div>

            {/* Meal Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {(['all', 'breakfast', 'lunch', 'dinner', 'snack'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setMealFilter(filter);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold capitalize text-xs border-2 border-b-4 transition-all duo-btn ${
                    mealFilter === filter
                      ? 'bg-[#e5f8d0] border-[#58cc02] text-[#2b7200]'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {filteredMeals.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
              <MascotOwl
                mood="happy"
                size="md"
                className="justify-center mb-3"
                speech="No meals logged yet this month! Click below to upload your first food photo!"
              />
              <button
                type="button"
                onClick={onOpenUploadMeal}
                className="mt-4 px-6 py-3 rounded-2xl font-bold text-white bg-[#58cc02] border-2 border-[#46a302] border-b-4 hover:bg-[#61e002] transition-all duo-btn shadow-sm"
              >
                + Log Food & Amount Spent
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMeals.map((meal) => {
                const date = new Date(meal.timestamp);
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

                return (
                  <div
                    key={meal.id}
                    className="p-4 rounded-2xl border-2 border-gray-200 border-b-4 hover:border-gray-300 transition-all bg-white flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Header: Image, Title, Price */}
                      <div className="flex gap-3 mb-3">
                        {meal.imageUrl ? (
                          <img
                            src={meal.imageUrl}
                            alt={meal.foodName}
                            className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-orange-50 border-2 border-orange-200 flex items-center justify-center text-3xl shrink-0">
                            🍲
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1.5">
                            <h4 className="font-fun font-bold text-base text-gray-900 leading-tight truncate">
                              {meal.foodName}
                            </h4>
                            <span className="font-fun font-extrabold text-sm text-[#2b7200] bg-green-50 px-2.5 py-0.5 rounded-xl border border-green-200 shrink-0">
                              {currency}{meal.amountSpent.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mt-1">
                            <span className="capitalize">{meal.mealType}</span>
                            <span>•</span>
                            <span>{dateStr}, {timeStr}</span>
                          </div>

                          {/* Water tag */}
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-[#0284c7]">
                            <Droplets className="w-3.5 h-3.5 fill-[#1cb0f6] text-[#1cb0f6]" />
                            <span>
                              {meal.waterLogged.totalLiters}L Water
                              {meal.waterLogged.sachets > 0 && ` (${meal.waterLogged.sachets} sachets)`}
                              {meal.waterLogged.bottles > 0 && ` (${meal.waterLogged.bottles} bottles)`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Nutrient Pills */}
                      <div className="flex flex-wrap gap-1.5 mb-2.5 text-xs font-bold">
                        <span className="bg-orange-50 text-orange-800 px-2 py-0.5 rounded-lg border border-orange-200">
                          🔥 {meal.nutrients.calories} kcal
                        </span>
                        <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-lg border border-blue-200">
                          🥩 {meal.nutrients.protein}g P
                        </span>
                        <span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded-lg border border-purple-200">
                          🍞 {meal.nutrients.carbs}g C
                        </span>
                        <span className="bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded-lg border border-yellow-200">
                          🥑 {meal.nutrients.fat}g F
                        </span>
                        {meal.nutrients.ironMg > 0 && (
                          <span className="bg-red-50 text-red-800 px-2 py-0.5 rounded-lg border border-red-200">
                            🩸 {meal.nutrients.ironMg}mg Fe
                          </span>
                        )}
                      </div>

                      {/* Mascot Cheer or Blood Tip */}
                      {meal.bloodTypeTip && (
                        <p className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded-xl border border-gray-200 line-clamp-2">
                          <strong className="text-gray-800">Blood Tip: </strong>
                          {meal.bloodTypeTip}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-400">
                        Health Grade: <span className="text-[#58cc02]">{meal.healthScore}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Delete this meal entry?')) {
                            sounds.playPop();
                            onDeleteMeal(meal.id);
                          }
                        }}
                        className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete meal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
