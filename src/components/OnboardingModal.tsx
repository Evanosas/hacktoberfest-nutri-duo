import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { UserProfile, BloodGroup, Sex } from '../types';
import { MascotOwl } from './MascotOwl';
import { sounds } from '../utils/audio';
import { User, Activity, Droplets, Heart, Sparkles, Check } from 'lucide-react';

interface OnboardingModalProps {
  initialProfile: UserProfile;
  isOpen: boolean;
  onSave: (profile: Partial<UserProfile>) => Promise<void>;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialProfile,
  isOpen,
  onSave,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState(initialProfile.name || '');
  const [age, setAge] = useState<number>(initialProfile.age || 25);
  const [weight, setWeight] = useState<number>(initialProfile.weight || 68);
  const [sex, setSex] = useState<Sex>(initialProfile.sex || 'female');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(initialProfile.bloodGroup || 'O+');
  const [currency, setCurrency] = useState(initialProfile.currency || '$');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const bloodTypes: { type: BloodGroup; label: string; desc: string; icon: string }[] = [
    { type: 'O+', label: 'O Positive', desc: 'Universal red blood donor type. Thrives on high lean protein & bioavailable iron.', icon: '🥩' },
    { type: 'O-', label: 'O Negative', desc: 'True universal donor. High cellular metabolic rate, benefits from leafy greens.', icon: '🥗' },
    { type: 'A+', label: 'A Positive', desc: 'Ancient agricultural lineage. Excels with plant-based proteins, grains & legumes.', icon: '🌱' },
    { type: 'A-', label: 'A Negative', desc: 'Sensitive immune profile. High fiber, antioxidant berries & gentle digestion.', icon: '🫐' },
    { type: 'B+', label: 'B Positive', desc: 'Nomadic lineage. Handles dairy, varied greens, poultry & hearty broths well.', icon: '🥛' },
    { type: 'B-', label: 'B Negative', desc: 'Rare adaptable type. Great with complex carbohydrates & balanced seafood.', icon: '🐟' },
    { type: 'AB+', label: 'AB Positive', desc: 'Universal plasma donor. Thrives on seafood, tofu, alkaline greens & olive oil.', icon: '🥑' },
    { type: 'AB-', label: 'AB Negative', desc: 'Rarest blood group. Balanced combination of Type A & B nutrient pathways.', icon: '🍋' },
  ];

  const handleNext = () => {
    sounds.playPop();
    setStep(2);
  };

  const handleFinish = async () => {
    sounds.playSuccessChime();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    setSaving(true);
    await onSave({
      name: name.trim() || 'Health Explorer',
      age: Number(age) || 25,
      weight: Number(weight) || 68,
      sex,
      bloodGroup,
      currency,
      onboardingComplete: true,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white border-4 border-[#e5e7eb] border-b-8 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Progress bar */}
        <div className="w-full bg-[#f1f3f5] h-3.5 rounded-full overflow-hidden mb-6 border border-gray-200">
          <div
            className="h-full bg-[#58cc02] transition-all duration-300 rounded-full"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>

        {/* Header Mascot banner */}
        <div className="flex items-center gap-4 mb-6">
          <MascotOwl
            mood={step === 1 ? 'happy' : 'cheering'}
            size="md"
            speech={
              step === 1
                ? "Hi! Let's personalize your nutritional blueprint!"
                : "Select your Blood Group so I can calibrate your foods!"
            }
          />
        </div>

        <div className="overflow-y-auto pr-1 flex-1 space-y-6">
          {step === 1 ? (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Your Name or Nickname
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full text-base font-semibold px-4 py-3 bg-gray-50 border-2 border-gray-200 border-b-4 rounded-2xl focus:outline-none focus:border-[#58cc02] focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full text-base font-semibold px-4 py-3 bg-gray-50 border-2 border-gray-200 border-b-4 rounded-2xl focus:outline-none focus:border-[#58cc02] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="300"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full text-base font-semibold px-4 py-3 bg-gray-50 border-2 border-gray-200 border-b-4 rounded-2xl focus:outline-none focus:border-[#58cc02] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Biological Sex
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['female', 'male', 'other'] as Sex[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        sounds.playPop();
                        setSex(s);
                      }}
                      className={`py-3 px-3 rounded-2xl font-bold capitalize text-sm border-2 border-b-4 transition-all duo-btn ${
                        sex === s
                          ? 'bg-[#e5f8d0] border-[#58cc02] text-[#2b7200]'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Preferred Currency for Food Budget
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { symbol: '$', label: 'USD ($)' },
                    { symbol: '₦', label: 'NGN (₦)' },
                    { symbol: '€', label: 'EUR (€)' },
                    { symbol: '£', label: 'GBP (£)' },
                    { symbol: '₹', label: 'INR (₹)' },
                  ].map((cur) => (
                    <button
                      key={cur.symbol}
                      type="button"
                      onClick={() => {
                        sounds.playPop();
                        setCurrency(cur.symbol);
                      }}
                      className={`py-2 px-2 rounded-xl font-bold text-sm border-2 border-b-4 transition-all duo-btn ${
                        currency === cur.symbol
                          ? 'bg-[#ddf4ff] border-[#1cb0f6] text-[#006f9e]'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {cur.symbol}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-[#ff4b4b] fill-[#ff4b4b]" />
                    Select Your Blood Group
                  </label>
                  <span className="text-xs font-semibold text-gray-400">Essential for custom diet tips</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {bloodTypes.map((bt) => (
                    <button
                      key={bt.type}
                      type="button"
                      onClick={() => {
                        sounds.playPop();
                        setBloodGroup(bt.type);
                      }}
                      className={`p-3 rounded-2xl text-left border-2 border-b-4 transition-all duo-btn ${
                        bloodGroup === bt.type
                          ? 'bg-[#ffe8e8] border-[#ff4b4b] text-[#c70000]'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-fun font-bold">{bt.type}</span>
                        <span className="text-lg">{bt.icon}</span>
                      </div>
                      <div className="text-[11px] font-semibold mt-1 opacity-80 line-clamp-1">{bt.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Blood Type Insight Card */}
              {bloodGroup && (
                <div className="p-4 rounded-2xl bg-[#fdf2f2] border-2 border-[#fca5a5] border-b-4 flex items-start gap-3 text-xs text-red-900">
                  <div className="text-2xl shrink-0 mt-0.5">💡</div>
                  <div>
                    <strong className="font-bold block text-sm mb-0.5">
                      Blood Group {bloodGroup} Nutritional Advantage:
                    </strong>
                    {bloodTypes.find((b) => b.type === bloodGroup)?.desc}
                  </div>
                </div>
              )}

              {/* Water logging note */}
              <div className="p-4 rounded-2xl bg-[#e0f6ff] border-2 border-[#7cd4fd] border-b-4 flex items-start gap-3 text-xs text-sky-950">
                <Droplets className="w-5 h-5 text-[#1cb0f6] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block text-sm mb-0.5">Hydration Tracking Ready!</strong>
                  You can log water anytime in <strong>Bottles</strong> (500ml/750ml) or standard <strong>Sachets</strong> ("pure water" packs).
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="pt-6 mt-4 border-t border-gray-100 flex items-center justify-between gap-3">
          {step === 2 && (
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                setStep(1);
              }}
              className="px-5 py-3 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 border-2 border-gray-200 border-b-4 transition-all duo-btn"
            >
              Back
            </button>
          )}

          <div className="ml-auto flex items-center gap-2">
            {step === 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3.5 rounded-2xl font-bold text-white bg-[#58cc02] border-2 border-[#46a302] border-b-4 hover:bg-[#61e002] transition-all duo-btn shadow-md flex items-center gap-2"
              >
                <span>Continue</span>
                <span className="text-lg">→</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={saving}
                onClick={handleFinish}
                className="px-8 py-3.5 rounded-2xl font-bold text-white bg-[#58cc02] border-2 border-[#46a302] border-b-4 hover:bg-[#61e002] transition-all duo-btn shadow-md flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>{saving ? 'Setting up...' : 'Start My Health Journey!'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
