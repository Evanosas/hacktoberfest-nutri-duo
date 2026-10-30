import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { HealthChallenge, UserProfile, FoodRecommendation } from '../types';
import { MascotOwl } from './MascotOwl';
import { sounds } from '../utils/audio';
import {
  Trophy,
  Sparkles,
  X,
  Droplets,
  Flame,
  Heart,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Utensils,
  RefreshCw,
  Award,
} from 'lucide-react';

interface HealthChallengesModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenges: HealthChallenge[];
  profile: UserProfile;
  remainingBudget: number;
  onQuickLogRecommendation?: (rec: FoodRecommendation) => void;
}

export const HealthChallengesModal: React.FC<HealthChallengesModalProps> = ({
  isOpen,
  onClose,
  challenges,
  profile,
  remainingBudget,
  onQuickLogRecommendation,
}) => {
  const [selectedChallenge, setSelectedChallenge] = useState<HealthChallenge | null>(challenges[0] || null);
  const [recommendations, setRecommendations] = useState<FoodRecommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    if (isOpen && challenges.length > 0) {
      const active = challenges.find((c) => !c.completed) || challenges[0];
      setSelectedChallenge(active);
      fetchRecommendations(active.category);
    }
  }, [isOpen, challenges]);

  if (!isOpen) return null;

  const fetchRecommendations = async (category: string) => {
    setLoadingRecs(true);
    try {
      const res = await fetch('/api/recommend-foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeCategory: category,
          targetBudgetRemaining: remainingBudget,
        }),
      });
      const data = await res.json();
      if (data.success && data.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleSelectChallenge = (chal: HealthChallenge) => {
    sounds.playPop();
    setSelectedChallenge(chal);
    fetchRecommendations(chal.category);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white border-4 border-[#e5e7eb] border-b-8 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
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

        {/* Mascot Banner */}
        <div className="flex items-center gap-4 mb-4">
          <MascotOwl
            mood="cheering"
            size="sm"
            speech={`Health Quests! I recommend nutrient-packed foods tailored to Blood Group ${profile.bloodGroup}!`}
          />
        </div>

        <div className="mb-4">
          <h2 className="text-2xl font-fun font-bold text-[#3c3c3c] flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#ffc800]" />
            Monthly Health Challenges & Nutrient AI
          </h2>
          <p className="text-xs font-semibold text-gray-500">
            Conquer challenges, earn XP crowns, and discover cost-effective meals rich in the exact nutrients your body needs!
          </p>
        </div>

        <div className="overflow-y-auto pr-1 flex-1 space-y-6">
          {/* Active Challenges Cards */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
              Select an Active Challenge:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {challenges.map((chal) => {
                const percent = Math.min(100, Math.round((chal.currentValue / chal.targetValue) * 100));
                const isSelected = selectedChallenge?.id === chal.id;

                return (
                  <button
                    key={chal.id}
                    type="button"
                    onClick={() => handleSelectChallenge(chal)}
                    className={`p-4 rounded-2xl text-left border-2 border-b-4 transition-all duo-btn ${
                      isSelected
                        ? 'bg-[#f5fbff] border-[#1cb0f6] shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-fun font-bold text-base text-[#3c3c3c]">
                        {chal.title}
                      </span>
                      <span className="text-xs font-bold text-[#ff9600] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                        +{chal.rewardXp} XP
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 mb-2 font-medium">
                      {chal.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-1.5 border border-gray-200">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          chal.completed ? 'bg-[#58cc02]' : 'bg-[#1cb0f6]'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
                      <span>
                        {chal.currentValue} / {chal.targetValue} {chal.unit}
                      </span>
                      <span>{percent}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Recommended Foods Section */}
          <div className="p-4 rounded-3xl bg-[#fafdf8] border-2 border-[#d5edd1] border-b-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#58cc02]" />
                <h3 className="font-fun font-bold text-lg text-gray-800">
                  Recommended Foods for {selectedChallenge?.title || 'This Challenge'}
                </h3>
              </div>
              <button
                type="button"
                disabled={loadingRecs}
                onClick={() => fetchRecommendations(selectedChallenge?.category || 'general')}
                className="p-1.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 text-xs font-bold flex items-center gap-1 duo-btn"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingRecs ? 'animate-spin' : ''}`} />
                <span>Refresh AI</span>
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-4 font-medium">
              Curated for your profile (<strong>{profile.age}y {profile.sex}, {profile.weight}kg, Blood Group {profile.bloodGroup}</strong>) to maximize nutrients while keeping costs low:
            </p>

            {loadingRecs ? (
              <div className="py-8 text-center">
                <div className="w-8 h-8 mx-auto mb-2 border-4 border-[#58cc02] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold text-gray-500">
                  NutriBuddy AI is calculating optimal nutrient-dense meals...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-white border-2 border-gray-200 border-b-4 hover:border-[#58cc02] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="font-fun font-bold text-sm text-gray-900 leading-tight">
                          {rec.mealName}
                        </span>
                        <span className="text-xs font-extrabold text-[#2b7200] bg-green-50 px-2 py-0.5 rounded-lg border border-green-200 shrink-0">
                          {profile.currency}{rec.costEstimate}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2">
                        <span>🔥 {rec.calories} kcal</span>
                        <span>•</span>
                        <span>🥩 {rec.protein}g Protein</span>
                      </div>

                      <div className="text-[11px] font-bold text-[#b45309] bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 mb-2">
                        ✨ {rec.keyNutrients}
                      </div>

                      <p className="text-[11px] text-gray-600 mb-2">
                        <strong className="text-gray-800">Blood Group {profile.bloodGroup}: </strong>
                        {rec.bloodGroupAdvantage}
                      </p>

                      <div className="text-[10px] text-emerald-800 bg-emerald-50/70 p-1.5 rounded-lg border border-emerald-100 mb-3 italic">
                        💡 {rec.duoTip}
                      </div>
                    </div>

                    {onQuickLogRecommendation && (
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playPop();
                          onQuickLogRecommendation(rec);
                          onClose();
                        }}
                        className="w-full py-2 rounded-xl font-bold text-xs bg-[#58cc02] border border-[#46a302] text-white hover:bg-[#61e002] transition-all duo-btn flex items-center justify-center gap-1.5 shadow-sm mt-auto"
                      >
                        <Utensils className="w-3.5 h-3.5" />
                        <span>Log this Meal</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
