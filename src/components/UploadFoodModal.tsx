import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { MealEntry, UserProfile } from '../types';
import { MascotOwl, MascotMood } from './MascotOwl';
import { sounds } from '../utils/audio';
import {
  Upload,
  Camera,
  X,
  Droplets,
  DollarSign,
  Sparkles,
  Flame,
  Zap,
  Info,
  Check,
  RefreshCw,
  Plus,
  Minus,
  Utensils,
} from 'lucide-react';

interface UploadFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  monthKey: string;
  onSaveMeal: (mealData: Partial<MealEntry>) => Promise<void>;
}

// Preset food meals for quick testing
const SAMPLE_MEALS = [
  {
    name: 'Jollof Rice with Grilled Chicken & Plantains',
    cost: 6.50,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    type: 'lunch' as const,
    calories: 590,
    protein: 38,
    carbs: 68,
    fat: 14,
    iron: 4.5,
  },
  {
    name: 'Avocado Toast with Poached Eggs & Citrus',
    cost: 4.20,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    type: 'breakfast' as const,
    calories: 420,
    protein: 18,
    carbs: 32,
    fat: 22,
    iron: 2.8,
  },
  {
    name: 'Hearty Lentil & Spinach Stew',
    cost: 3.20,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    type: 'dinner' as const,
    calories: 480,
    protein: 26,
    carbs: 72,
    fat: 8,
    iron: 6.8,
  },
  {
    name: 'Grilled Salmon with Brown Rice & Broccoli',
    cost: 8.90,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80',
    type: 'dinner' as const,
    calories: 560,
    protein: 44,
    carbs: 48,
    fat: 18,
    iron: 3.2,
  },
];

export const UploadFoodModal: React.FC<UploadFoodModalProps> = ({
  isOpen,
  onClose,
  profile,
  monthKey,
  onSaveMeal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string>('');
  const [foodName, setFoodName] = useState<string>('');
  const [amountSpent, setAmountSpent] = useState<string>('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [portionDesc, setPortionDesc] = useState<string>('1 regular plate');

  // Water intake with this meal
  const [bottles, setBottles] = useState<number>(1);
  const [sachets, setSachets] = useState<number>(0);
  const [bottleVolumeMl, setBottleVolumeMl] = useState<number>(750);
  const [sachetVolumeMl, setSachetVolumeMl] = useState<number>(500);

  // Nutritional breakdown
  const [calories, setCalories] = useState<number>(520);
  const [protein, setProtein] = useState<number>(28);
  const [carbs, setCarbs] = useState<number>(56);
  const [fat, setFat] = useState<number>(16);
  const [fiber, setFiber] = useState<number>(7);
  const [ironMg, setIronMg] = useState<number>(4.2);
  const [calciumMg, setCalciumMg] = useState<number>(110);
  const [vitaminCMg, setVitaminCMg] = useState<number>(35);
  const [healthScore, setHealthScore] = useState<'A+' | 'A' | 'B' | 'C' | 'D'>('A');
  const [bloodTypeTip, setBloodTypeTip] = useState<string>('');
  const [mascotCheer, setMascotCheer] = useState<string>('');

  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mascotMood, setMascotMood] = useState<MascotMood>('happy');

  if (!isOpen) return null;

  // Calculate total water in Liters
  const totalWaterLiters = Number(
    ((bottles * bottleVolumeMl + sachets * sachetVolumeMl) / 1000).toFixed(2)
  );

  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const maxDim = 1024;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          resolve(compressed);
        } else {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      };
      img.src = url;
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sounds.playPop();
      setAnalyzing(true);
      try {
        const compressedBase64 = await compressImageFile(file);
        setImagePreview(compressedBase64);
        analyzeMealWithAI(compressedBase64, foodName);
      } catch (err) {
        console.error('Error compressing image:', err);
        setAnalyzing(false);
      }
    }
  };

  const selectSampleMeal = (sample: typeof SAMPLE_MEALS[0]) => {
    sounds.playPop();
    setImagePreview(sample.image);
    setFoodName(sample.name);
    setAmountSpent(String(sample.cost));
    setMealType(sample.type);
    setCalories(sample.calories);
    setProtein(sample.protein);
    setCarbs(sample.carbs);
    setFat(sample.fat);
    setIronMg(sample.iron);
    setHealthScore('A+');
    setBloodTypeTip(
      `Great for Blood Group ${profile.bloodGroup}: Provides bioavailable nutrients matching your metabolic profile.`
    );
    setMascotCheer(`Delicious choice! ${sample.protein}g protein logged into your dashboard! 🦉💪`);
    setMascotMood('cheering');
  };

  const analyzeMealWithAI = async (imgData?: string, hint?: string) => {
    const dataToSend = imgData || imagePreview;
    if (!dataToSend && !hint && !foodName) {
      alert('Please upload a food photo or enter a meal name first!');
      return;
    }

    setAnalyzing(true);
    setMascotMood('thinking');
    sounds.playPop();

    try {
      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: dataToSend,
          foodHint: hint || foodName,
          amountSpent: amountSpent,
        }),
      });

      const json = await res.json();
      if (json.success && json.analysis) {
        const a = json.analysis;
        setFoodName(a.foodName || foodName || 'Nutritious Meal');
        setPortionDesc(a.portionDescription || '1 regular serving');
        setCalories(Math.round(a.calories || 480));
        setProtein(Math.round(a.protein || 24));
        setCarbs(Math.round(a.carbs || 50));
        setFat(Math.round(a.fat || 15));
        setFiber(Math.round(a.fiber || 6));
        setIronMg(Number(Number(a.ironMg || 3.5).toFixed(1)));
        setCalciumMg(Math.round(a.calciumMg || 100));
        setVitaminCMg(Math.round(a.vitaminCMg || 30));
        setHealthScore(a.healthScore || 'A');
        setBloodTypeTip(a.bloodTypeTip || '');
        setMascotCheer(a.mascotCheer || 'High-five on your healthy choice! 🦉');
        setMascotMood('cheering');
        sounds.playSuccessChime();
      }
    } catch (err) {
      console.error('Error analyzing meal:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) {
      alert('Please provide a name for this food item.');
      return;
    }

    sounds.playSuccessChime();
    confetti({
      particleCount: 110,
      spread: 75,
      origin: { y: 0.6 },
    });

    setSaving(true);
    await onSaveMeal({
      monthKey,
      timestamp: new Date().toISOString(),
      foodName: foodName.trim(),
      portionDescription: portionDesc,
      mealType,
      amountSpent: parseFloat(amountSpent) || 0,
      imageUrl: imagePreview || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80',
      nutrients: {
        calories,
        protein,
        carbs,
        fat,
        fiber,
        ironMg,
        calciumMg,
        vitaminCMg,
        vitaminAIu: 600,
        sodiumMg: 380,
      },
      waterLogged: {
        bottles,
        sachets,
        bottleVolumeMl,
        sachetVolumeMl,
        totalLiters: totalWaterLiters,
      },
      healthScore,
      bloodTypeTip,
      mascotCheer,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border-4 border-[#e5e7eb] border-b-8 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
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
        <div className="flex items-center gap-3 mb-3">
          <MascotOwl
            mood={analyzing ? 'thinking' : mascotMood}
            size="sm"
            speech={
              mascotCheer ||
              'Snap a picture of your food & enter what you spent! Don\'t forget your water!'
            }
          />
        </div>

        <div className="mb-3">
          <h2 className="text-2xl font-fun font-bold text-[#3c3c3c]">
            Log Food, Spending & Water Intake
          </h2>
          <p className="text-xs font-semibold text-gray-500">
            Upload a meal photo. Our AI scans calories & nutrients while tracking your budget and water bottles or sachets!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 flex-1 space-y-4">
          {/* 1. Food Picture Upload & Preview */}
          <div className="p-4 rounded-2xl bg-gray-50 border-2 border-gray-200 border-b-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#1cb0f6]" />
                Food Picture
              </label>
              <span className="text-[11px] font-semibold text-gray-400">
                Snap or upload
              </span>
            </div>

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 aspect-video sm:aspect-21/9 max-h-48 bg-black">
                <img
                  src={imagePreview}
                  alt="Meal preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setImagePreview('');
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-xl backdrop-blur-md transition-all"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={analyzing}
                  onClick={() => analyzeMealWithAI()}
                  className="absolute bottom-2 right-2 px-3 py-1.5 bg-[#58cc02] border border-[#46a302] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 duo-btn"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{analyzing ? 'Scanning...' : 'Re-scan with AI'}</span>
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-[#58cc02] rounded-2xl p-4 text-center cursor-pointer bg-white hover:bg-[#f9fdf6] transition-all group"
              >
                <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-green-50 border-2 border-[#58cc02] flex items-center justify-center text-[#58cc02] group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-gray-700">
                  Tap to upload or take a photo of your meal
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  PNG, JPG or camera capture
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />

            {/* Quick Sample Meals pills */}
            <div className="mt-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                Or pick a quick sample meal:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_MEALS.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => selectSampleMeal(s)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-white border border-gray-200 hover:border-[#58cc02] hover:bg-[#f2fbe8] text-gray-700 transition-all"
                  >
                    🍴 {s.name.split(' ')[0]} {s.name.split(' ')[1]} ({profile.currency}{s.cost})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Food Name & Amount Spent Textboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Food Name / Description
              </label>
              <input
                type="text"
                required
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g. Chicken & Brown Rice Bowl"
                className="w-full text-base font-bold px-4 py-2.5 bg-white border-2 border-gray-200 border-b-4 rounded-2xl focus:outline-none focus:border-[#58cc02] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2b7200] mb-1.5 flex items-center justify-between">
                <span>Amount Spent on this Food</span>
                <span className="text-[11px] font-semibold text-gray-400">Deducts from budget</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-base">
                  {profile.currency}
                </span>
                <input
                  type="number"
                  step="any"
                  required
                  min="0"
                  value={amountSpent}
                  onChange={(e) => setAmountSpent(e.target.value)}
                  placeholder="e.g. 7.50 or 2500"
                  className="w-full text-base font-bold pl-9 pr-4 py-2.5 bg-white border-2 border-gray-200 border-b-4 rounded-2xl focus:outline-none focus:border-[#58cc02] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Meal Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Meal Timing
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setMealType(t);
                  }}
                  className={`py-2 px-2 rounded-xl font-bold capitalize text-xs border-2 border-b-4 transition-all duo-btn ${
                    mealType === t
                      ? 'bg-[#e5f8d0] border-[#58cc02] text-[#2b7200]'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Water Intake Section (Bottles & Sachets) */}
          <div className="p-4 rounded-2xl bg-[#eef9ff] border-2 border-[#b9e6fe] border-b-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-[#1cb0f6] fill-[#1cb0f6]" />
                <span className="text-sm font-bold text-[#0369a1]">
                  Water Taken with this Meal
                </span>
              </div>
              <span className="text-xs font-extrabold text-[#0284c7] bg-white px-2.5 py-1 rounded-full border border-[#b9e6fe]">
                Total: {totalWaterLiters} Liters
              </span>
            </div>

            <p className="text-xs text-sky-800 mb-3 font-medium">
              Write how much water you took in bottles or sachet water ("pure water"):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Bottle water counter */}
              <div className="bg-white p-3 rounded-2xl border-2 border-gray-200 border-b-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-700 block">
                    Bottles of Water
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 font-semibold">
                    <span>Size:</span>
                    <select
                      value={bottleVolumeMl}
                      onChange={(e) => setBottleVolumeMl(Number(e.target.value))}
                      className="text-[11px] font-bold text-gray-600 bg-gray-50 rounded px-1 border border-gray-200 focus:outline-none"
                    >
                      <option value={500}>500 ml</option>
                      <option value={750}>750 ml</option>
                      <option value={1000}>1,000 ml</option>
                      <option value={1500}>1,500 ml</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playPop();
                      setBottles((prev) => Math.max(0, prev - 1));
                    }}
                    className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 font-bold text-gray-600 flex items-center justify-center duo-btn"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-7 text-center font-fun font-bold text-lg text-gray-800">
                    {bottles}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playWaterDrop();
                      setBottles((prev) => prev + 1);
                    }}
                    className="w-8 h-8 rounded-xl bg-[#1cb0f6] border-2 border-[#1899d6] font-bold text-white flex items-center justify-center duo-btn"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sachet water counter */}
              <div className="bg-white p-3 rounded-2xl border-2 border-gray-200 border-b-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-700 block">
                    Sachet Water ("Pure Water")
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 font-semibold">
                    <span>Size:</span>
                    <select
                      value={sachetVolumeMl}
                      onChange={(e) => setSachetVolumeMl(Number(e.target.value))}
                      className="text-[11px] font-bold text-gray-600 bg-gray-50 rounded px-1 border border-gray-200 focus:outline-none"
                    >
                      <option value={500}>500 ml (Standard)</option>
                      <option value={600}>600 ml</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playPop();
                      setSachets((prev) => Math.max(0, prev - 1));
                    }}
                    className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 font-bold text-gray-600 flex items-center justify-center duo-btn"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-7 text-center font-fun font-bold text-lg text-gray-800">
                    {sachets}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playWaterDrop();
                      setSachets((prev) => prev + 1);
                    }}
                    className="w-8 h-8 rounded-xl bg-[#1cb0f6] border-2 border-[#1899d6] font-bold text-white flex items-center justify-center duo-btn"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. AI Detected Nutrients & Macro Breakdown */}
          <div className="p-4 rounded-2xl bg-white border-2 border-gray-200 border-b-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#ffc800]" />
                Nutrients & Calories Gained (Editable)
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-gray-400">Grade:</span>
                <span className="px-2 py-0.5 rounded-lg bg-[#58cc02] text-white font-extrabold text-xs">
                  {healthScore}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-[#fff9f0] p-2.5 rounded-xl border border-orange-200">
                <span className="text-[10px] font-bold uppercase text-orange-700 block">
                  Calories
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(Number(e.target.value))}
                    className="w-16 font-fun font-bold text-base text-orange-900 bg-transparent focus:outline-none"
                  />
                  <span className="text-xs font-bold text-orange-600">kcal</span>
                </div>
              </div>

              <div className="bg-[#f2f7ff] p-2.5 rounded-xl border border-blue-200">
                <span className="text-[10px] font-bold uppercase text-blue-700 block">
                  Protein
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(Number(e.target.value))}
                    className="w-14 font-fun font-bold text-base text-blue-900 bg-transparent focus:outline-none"
                  />
                  <span className="text-xs font-bold text-blue-600">g</span>
                </div>
              </div>

              <div className="bg-[#fcf5ff] p-2.5 rounded-xl border border-purple-200">
                <span className="text-[10px] font-bold uppercase text-purple-700 block">
                  Carbs
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(Number(e.target.value))}
                    className="w-14 font-fun font-bold text-base text-purple-900 bg-transparent focus:outline-none"
                  />
                  <span className="text-xs font-bold text-purple-600">g</span>
                </div>
              </div>

              <div className="bg-[#fefce8] p-2.5 rounded-xl border border-yellow-200">
                <span className="text-[10px] font-bold uppercase text-yellow-800 block">
                  Iron
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    value={ironMg}
                    onChange={(e) => setIronMg(Number(e.target.value))}
                    className="w-14 font-fun font-bold text-base text-yellow-900 bg-transparent focus:outline-none"
                  />
                  <span className="text-xs font-bold text-yellow-700">mg</span>
                </div>
              </div>
            </div>

            {/* Blood type suitability tip */}
            {bloodTypeTip && (
              <div className="mt-3 p-3 rounded-xl bg-[#fff5f5] border border-[#fecaca] text-xs text-red-900 flex items-start gap-2">
                <span className="font-bold text-base shrink-0">🩸</span>
                <div>
                  <span className="font-bold">Blood Group {profile.bloodGroup} Tip: </span>
                  {bloodTypeTip}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={saving || analyzing}
              className="w-full py-4 rounded-2xl font-bold text-white bg-[#58cc02] border-2 border-[#46a302] border-b-4 hover:bg-[#61e002] transition-all duo-btn shadow-md flex items-center justify-center gap-2 text-base"
            >
              <Utensils className="w-5 h-5" />
              <span>{saving ? 'Logging Meal & Water...' : 'Log Meal & Water (+25 XP)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
