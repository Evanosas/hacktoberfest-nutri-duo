import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { UserProfile, BloodGroup, Sex } from '../types';
import { MascotOwl } from './MascotOwl';
import { sounds } from '../utils/audio';
import { User, Heart, X, Scale, Sparkles, Check, Droplets } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updates: Partial<UserProfile>) => Promise<void>;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age);
  const [weight, setWeight] = useState(profile.weight);
  const [sex, setSex] = useState<Sex>(profile.sex);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(profile.bloodGroup);
  const [currency, setCurrency] = useState(profile.currency);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const bloodGroupInfo: Record<BloodGroup, { title: string; tips: string; foods: string; avoid: string }> = {
    'O+': {
      title: 'Type O+ (The Hunter / Universal Cell Red Donor)',
      tips: 'High stomach acid handles lean animal proteins efficiently. Requires adequate bioavailable iron for peak energy.',
      foods: 'Lean poultry, wild fish, eggs, spinach, broccoli, pumpkin seeds, sweet potatoes.',
      avoid: 'Excess refined flour and excessive dairy can cause sluggish digestion.',
    },
    'O-': {
      title: 'Type O- (The Universal Donor)',
      tips: 'Fast metabolism but sensitive to insulin spikes. High bioavailable protein keeps energy stable.',
      foods: 'Grass-fed lean meats, salmon, leafy greens, berries, walnuts.',
      avoid: 'High gluten breads, processed trans fats.',
    },
    'A+': {
      title: 'Type A+ (The Agrarian Cultivator)',
      tips: 'Naturally lower stomach acid; flourishes on plant-centric nutrition, high fiber, and fermented foods.',
      foods: 'Lentils, chickpeas, tofu, oats, olive oil, berries, green vegetables.',
      avoid: 'Heavy red meats and processed sausages.',
    },
    'A-': {
      title: 'Type A- (Plant-Based Vitality)',
      tips: 'Gentle gastrointestinal tract. High antioxidant intake optimizes cardiovascular and immune stamina.',
      foods: 'Quinoa, beans, walnuts, blueberries, olive oil, dark leafy greens.',
      avoid: 'Excess sodium and processed cheeses.',
    },
    'B+': {
      title: 'Type B+ (The Nomad / Adaptable Explorer)',
      tips: 'Very versatile digestive system. Easily metabolizes cultured dairy, eggs, and varied produce.',
      foods: 'Yogurt, cottage cheese, eggs, salmon, bananas, oatmeal, green tea.',
      avoid: 'Corn, peanuts, and sesame seeds.',
    },
    'B-': {
      title: 'Type B- (Balanced Adaptability)',
      tips: 'Thrives on balanced micro-nutrients, clean hydration, and quality dietary proteins.',
      foods: 'Trout, mackerel, oats, steamed greens, beets, kefir.',
      avoid: 'Heavy processed oils and deep-fried fast foods.',
    },
    'AB+': {
      title: 'Type AB+ (The Modern Synthesizer / Plasma Donor)',
      tips: 'Combines biological traits of Type A and B. Benefits from seafood and alkaline rich fruits.',
      foods: 'Seafood, tofu, dairy, green veggies, kelp, cherries, pineapple.',
      avoid: 'Smoked cured meats, caffeine in excess.',
    },
    'AB-': {
      title: 'Type AB- (Rare Precision Synthesizer)',
      tips: 'Unique metabolic blueprint requiring balanced smaller meals with abundant hydration.',
      foods: 'Tuna, cod, legumes, rice, leafy greens, olive oil.',
      avoid: 'Heavy greasy meats, corn syrup.',
    },
  };

  const currentInfo = bloodGroupInfo[bloodGroup];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSuccessChime();
    confetti({
      particleCount: 70,
      spread: 60,
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
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white border-4 border-[#e5e7eb] border-b-8 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
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

        {/* Mascot */}
        <div className="flex items-center gap-3 mb-4">
          <MascotOwl
            mood="proud"
            size="sm"
            speech={`Level ${profile.level} Health Cadet! Keep your stats updated for precision nutrition!`}
          />
        </div>

        <div className="mb-4">
          <h2 className="text-2xl font-fun font-bold text-[#3c3c3c]">
            Your Health Profile & Blood Group
          </h2>
          <p className="text-xs font-semibold text-gray-500">
            Age, weight, sex, and blood group calibrate your calorie burn, water needs, and nutrient recommendations.
          </p>
        </div>

        <form onSubmit={handleSave} className="overflow-y-auto pr-1 flex-1 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              Full Name / Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-base font-bold px-4 py-2.5 bg-gray-50 border-2 border-gray-200 border-b-4 rounded-2xl focus:outline-none focus:border-[#58cc02]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Age (Years)
              </label>
              <input
                type="number"
                min="10"
                max="120"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full text-base font-bold px-4 py-2.5 bg-gray-50 border-2 border-gray-200 border-b-4 rounded-2xl focus:outline-none focus:border-[#58cc02]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                min="20"
                max="300"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full text-base font-bold px-4 py-2.5 bg-gray-50 border-2 border-gray-200 border-b-4 rounded-2xl focus:outline-none focus:border-[#58cc02]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Biological Sex
              </label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as Sex)}
                className="w-full text-sm font-bold px-3 py-2.5 bg-gray-50 border-2 border-gray-200 border-b-4 rounded-2xl focus:outline-none focus:border-[#58cc02] capitalize"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full text-sm font-bold px-3 py-2.5 bg-gray-50 border-2 border-gray-200 border-b-4 rounded-2xl focus:outline-none focus:border-[#58cc02]"
              >
                <option value="$">USD ($)</option>
                <option value="₦">NGN (₦)</option>
                <option value="€">EUR (€)</option>
                <option value="£">GBP (£)</option>
                <option value="₹">INR (₹)</option>
              </select>
            </div>
          </div>

          {/* Blood Group Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-[#ff4b4b] fill-[#ff4b4b]" />
              Blood Group
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setBloodGroup(bg);
                  }}
                  className={`py-2 px-2 rounded-xl font-fun font-bold text-sm border-2 border-b-4 transition-all duo-btn ${
                    bloodGroup === bg
                      ? 'bg-[#ffe8e8] border-[#ff4b4b] text-[#c70000]'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Blood Group Biological Blueprint Card */}
          {currentInfo && (
            <div className="p-4 rounded-2xl bg-[#fff5f5] border-2 border-[#fecaca] border-b-4 space-y-2 text-xs">
              <div className="font-bold text-sm text-red-900 flex items-center gap-1.5">
                <span>🩸</span>
                <span>{currentInfo.title}</span>
              </div>
              <p className="text-red-950 font-medium">
                {currentInfo.tips}
              </p>
              <div className="text-emerald-900 bg-white/70 p-2 rounded-xl border border-emerald-100">
                <strong className="block text-emerald-800">Optimal Nutrient Powerhouses:</strong>
                {currentInfo.foods}
              </div>
              <div className="text-amber-900 bg-white/70 p-2 rounded-xl border border-amber-100">
                <strong className="block text-amber-800">Foods to Moderate:</strong>
                {currentInfo.avoid}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-2xl font-bold text-white bg-[#58cc02] border-2 border-[#46a302] border-b-4 hover:bg-[#61e002] transition-all duo-btn shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>{saving ? 'Updating Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
