import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { MonthlyGoal, UserProfile } from '../types';
import { MascotOwl } from './MascotOwl';
import { sounds } from '../utils/audio';
import { DollarSign, Flame, Target, Droplets, Sparkles, X, CheckCircle2, HelpCircle } from 'lucide-react';

interface MonthlyGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoal: MonthlyGoal;
  monthKey: string;
  profile: UserProfile;
  onSave: (goal: MonthlyGoal) => Promise<void>;
}

export const MonthlyGoalModal: React.FC<MonthlyGoalModalProps> = ({
  isOpen,
  onClose,
  currentGoal,
  monthKey,
  profile,
  onSave,
}) => {
  const [foodBudget, setFoodBudget] = useState<string>(String(currentGoal.foodBudget || 300));
  const [targetCalories, setTargetCalories] = useState<string>(String(currentGoal.targetCalories || 60000));
  const [targetProtein, setTargetProtein] = useState<string>(String(currentGoal.targetProtein || 3000));
  const [targetCarbs, setTargetCarbs] = useState<string>(String(currentGoal.targetCarbs || 7500));
  const [targetFat, setTargetFat] = useState<string>(String(currentGoal.targetFat || 2000));
  const [targetFiber, setTargetFiber] = useState<string>(String(currentGoal.targetFiber || 900));
  const [targetWaterLiters, setTargetWaterLiters] = useState<string>(String(currentGoal.targetWaterLiters || 75));
  const [notes, setNotes] = useState<string>(currentGoal.notes || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFoodBudget(String(currentGoal.foodBudget || 300));
      setTargetCalories(String(currentGoal.targetCalories || 60000));
      setTargetProtein(String(currentGoal.targetProtein || 3000));
      setTargetCarbs(String(currentGoal.targetCarbs || 7500));
      setTargetFat(String(currentGoal.targetFat || 2000));
      setTargetFiber(String(currentGoal.targetFiber || 900));
      setTargetWaterLiters(String(currentGoal.targetWaterLiters || 75));
      setNotes(currentGoal.notes || '');
    }
  }, [isOpen, currentGoal]);

  if (!isOpen) return null;

  const numCalories = Number(targetCalories) || 0;
  const dailyCalories = Math.round(numCalories / 30);
  const numWater = Number(targetWaterLiters) || 0;
  const dailyWater = (numWater / 30).toFixed(1);
  const dailySachets = Math.round((numWater * 1000) / (30 * 500)); // 500ml per sachet

  // Quick preset helper
  const applyPreset = (preset: {
    budget: number;
    cal: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    water: number;
    note: string;
  }) => {
    sounds.playPop();
    setFoodBudget(String(preset.budget));
    setTargetCalories(String(preset.cal));
    setTargetProtein(String(preset.protein));
    setTargetCarbs(String(preset.carbs));
    setTargetFat(String(preset.fat));
    setTargetFiber(String(preset.fiber));
    setTargetWaterLiters(String(preset.water));
    setNotes(preset.note);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSuccessChime();
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.5 },
    });

    setSaving(true);
    await onSave({
      monthKey,
      foodBudget: parseFloat(foodBudget) || 0,
      targetCalories: parseInt(targetCalories, 10) || 0,
      targetProtein: parseInt(targetProtein, 10) || 0,
      targetCarbs: parseInt(targetCarbs, 10) || 0,
      targetFat: parseInt(targetFat, 10) || 0,
      targetFiber: parseInt(targetFiber, 10) || 0,
      targetWaterLiters: parseFloat(targetWaterLiters) || 0,
      notes: notes.trim(),
      updatedAt: new Date().toISOString(),
    });
    setSaving(false);
    onClose();
  };

  // Format month for display
  const [year, month] = monthKey.split('-');
  const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  const monthName = dateObj.toLocaleDateString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border-4 border-[#e5e7eb] border-b-8 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playPop();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header Mascot banner */}
        <div className="flex items-center gap-4 mb-4">
          <MascotOwl
            mood="thinking"
            size="sm"
            speech={`Set your target goals for ${monthName}! Upload via the textboxes below.`}
          />
        </div>

        {/* Title */}
        <div className="mb-4">
          <h2 className="text-2xl font-fun font-bold text-[#3c3c3c]">
            Monthly Budget & Nutrient Targets
          </h2>
          <p className="text-xs font-semibold text-gray-500">
            Define how much you want to spend and the total calories, macros & water you want to achieve this month.
          </p>
        </div>

        {/* Quick presets pills */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Presets:</span>
          <button
            type="button"
            onClick={() =>
              applyPreset({
                budget: 250,
                cal: 60000,
                protein: 3600,
                carbs: 7200,
                fat: 1800,
                fiber: 900,
                water: 75,
                note: 'High protein on a budget! Focus on lentils, eggs, and local greens.',
              })
            }
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#eaf7dc] border border-[#58cc02] text-[#2b7200] hover:bg-[#d8f4bc] transition-all duo-btn"
          >
            💪 Thrifty High Protein
          </button>
          <button
            type="button"
            onClick={() =>
              applyPreset({
                budget: 350,
                cal: 54000,
                protein: 3000,
                carbs: 6000,
                fat: 1700,
                fiber: 960,
                water: 90,
                note: 'Clean deficit: 1,800 kcal/day with maximum hydration & fiber.',
              })
            }
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#e0f6ff] border border-[#1cb0f6] text-[#006f9e] hover:bg-[#c9eeff] transition-all duo-btn"
          >
            💧 Lean & Hydrated
          </button>
          <button
            type="button"
            onClick={() =>
              applyPreset({
                budget: 450,
                cal: 75000,
                protein: 4200,
                carbs: 9000,
                fat: 2500,
                fiber: 1000,
                water: 90,
                note: 'Muscle gain & athletic stamina: 2,500 kcal/day.',
              })
            }
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#fff2cc] border border-[#ffc800] text-[#7a5700] hover:bg-[#ffe9a3] transition-all duo-btn"
          >
            ⚡ Bulk & Muscle Build
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 flex-1 space-y-4">
          {/* 1. Monthly Food Budget Textbox */}
          <div className="p-4 rounded-2xl bg-[#f7faf4] border-2 border-[#d5edd1] border-b-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2d6812] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#58cc02]" />
                Monthly Food Budget ({profile.currency})
              </span>
              <span className="text-[11px] font-semibold text-gray-500">
                ~{(Number(foodBudget) / 30).toFixed(2)} {profile.currency} / day
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-lg">
                {profile.currency}
              </span>
              <input
                type="number"
                step="any"
                required
                min="1"
                value={foodBudget}
                onChange={(e) => setFoodBudget(e.target.value)}
                placeholder="e.g. 350 or 150000"
                className="w-full text-lg font-bold pl-10 pr-4 py-3 bg-white border-2 border-gray-200 border-b-4 rounded-2xl focus:outline-none focus:border-[#58cc02] transition-all text-[#3c3c3c]"
              />
            </div>
            <p className="text-[11px] font-medium text-gray-500 mt-1">
              Every meal you log will deduct from this monthly allowance to calculate spending efficiency.
            </p>
          </div>

          {/* 2. Monthly Calories Target Textbox */}
          <div className="p-4 rounded-2xl bg-[#fff9f0] border-2 border-[#fed7aa] border-b-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#9a3412] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#ff9600]" />
                Monthly Target Calories (kcal)
              </span>
              <span className="text-[11px] font-semibold text-[#c2410c]">
                ~{dailyCalories} kcal / day
              </span>
            </label>
            <input
              type="number"
              required
              min="1000"
              step="100"
              value={targetCalories}
              onChange={(e) => setTargetCalories(e.target.value)}
              placeholder="e.g. 60000"
              className="w-full text-lg font-bold px-4 py-3 bg-white border-2 border-gray-200 border-b-4 rounded-2xl focus:outline-none focus:border-[#ff9600] transition-all text-[#3c3c3c]"
            />
            <p className="text-[11px] font-medium text-gray-500 mt-1">
              Example: 60,000 kcal for 30 days is exactly 2,000 kcal / day.
            </p>
          </div>

          {/* 3. Monthly Water Target in Liters Textbox */}
          <div className="p-4 rounded-2xl bg-[#f0f9ff] border-2 border-[#bae6fd] border-b-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0369a1] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-[#1cb0f6]" />
                Monthly Water Intake Goal (Liters)
              </span>
              <span className="text-[11px] font-semibold text-[#0284c7]">
                ~{dailyWater} L / day (~{dailySachets} sachets / day)
              </span>
            </label>
            <input
              type="number"
              step="any"
              required
              min="1"
              value={targetWaterLiters}
              onChange={(e) => setTargetWaterLiters(e.target.value)}
              placeholder="e.g. 75"
              className="w-full text-lg font-bold px-4 py-3 bg-white border-2 border-gray-200 border-b-4 rounded-2xl focus:outline-none focus:border-[#1cb0f6] transition-all text-[#3c3c3c]"
            />
            <p className="text-[11px] font-medium text-gray-500 mt-1">
              75 Liters = approx. 150 standard 500ml pure water sachets or 100 750ml bottles.
            </p>
          </div>

          {/* 4. Macro Nutrients Textboxes (Protein, Carbs, Fats, Fiber) */}
          <div className="p-4 rounded-2xl bg-[#fafafa] border-2 border-gray-200 border-b-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#ce82ff]" />
              Monthly Macronutrient Targets (Grams)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[11px] font-bold text-gray-500 block mb-1">
                  Protein (g)
                </span>
                <input
                  type="number"
                  min="0"
                  value={targetProtein}
                  onChange={(e) => setTargetProtein(e.target.value)}
                  placeholder="3000"
                  className="w-full font-bold px-3 py-2.5 bg-white border-2 border-gray-200 border-b-4 rounded-xl focus:border-[#ce82ff] focus:outline-none text-sm"
                />
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  ~{Math.round((Number(targetProtein) || 0) / 30)}g/day
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-gray-500 block mb-1">
                  Carbs (g)
                </span>
                <input
                  type="number"
                  min="0"
                  value={targetCarbs}
                  onChange={(e) => setTargetCarbs(e.target.value)}
                  placeholder="7500"
                  className="w-full font-bold px-3 py-2.5 bg-white border-2 border-gray-200 border-b-4 rounded-xl focus:border-[#1cb0f6] focus:outline-none text-sm"
                />
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  ~{Math.round((Number(targetCarbs) || 0) / 30)}g/day
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-gray-500 block mb-1">
                  Healthy Fats (g)
                </span>
                <input
                  type="number"
                  min="0"
                  value={targetFat}
                  onChange={(e) => setTargetFat(e.target.value)}
                  placeholder="2000"
                  className="w-full font-bold px-3 py-2.5 bg-white border-2 border-gray-200 border-b-4 rounded-xl focus:border-[#ffc800] focus:outline-none text-sm"
                />
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  ~{Math.round((Number(targetFat) || 0) / 30)}g/day
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-gray-500 block mb-1">
                  Fiber (g)
                </span>
                <input
                  type="number"
                  min="0"
                  value={targetFiber}
                  onChange={(e) => setTargetFiber(e.target.value)}
                  placeholder="900"
                  className="w-full font-bold px-3 py-2.5 bg-white border-2 border-gray-200 border-b-4 rounded-xl focus:border-[#58cc02] focus:outline-none text-sm"
                />
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  ~{Math.round((Number(targetFiber) || 0) / 30)}g/day
                </span>
              </div>
            </div>
          </div>

          {/* 5. Custom Notes Textbox */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Personal Monthly Health Focus / Intention (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Prioritize high-iron leafy greens for Blood Group O, drink 4 sachets of water daily!"
              className="w-full text-sm font-medium px-4 py-2.5 bg-white border-2 border-gray-200 border-b-4 rounded-2xl focus:outline-none focus:border-[#58cc02] transition-all"
            />
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 rounded-2xl font-bold text-white bg-[#58cc02] border-2 border-[#46a302] border-b-4 hover:bg-[#61e002] transition-all duo-btn shadow-md flex items-center justify-center gap-2 text-base"
            >
              <Sparkles className="w-5 h-5" />
              <span>{saving ? 'Saving Monthly Goals...' : 'Save Monthly Goals (+30 XP)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
