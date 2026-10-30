import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { MascotOwl } from './MascotOwl';
import { sounds } from '../utils/audio';
import { Droplets, X, Plus, Minus, Sparkles } from 'lucide-react';

interface QuickWaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveWater: (bottles: number, sachets: number) => Promise<void>;
}

export const QuickWaterModal: React.FC<QuickWaterModalProps> = ({
  isOpen,
  onClose,
  onSaveWater,
}) => {
  const [bottles, setBottles] = useState<number>(0);
  const [sachets, setSachets] = useState<number>(1);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const totalLiters = Number(((bottles * 0.75) + (sachets * 0.5)).toFixed(2));

  const handleQuickLog = async () => {
    if (bottles === 0 && sachets === 0) {
      alert('Please select at least 1 bottle or 1 sachet of water.');
      return;
    }
    sounds.playWaterDrop();
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#1cb0f6', '#00e5ff', '#ffffff'],
    });

    setSaving(true);
    await onSaveWater(bottles, sachets);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border-4 border-[#e5e7eb] border-b-8 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playPop();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mascot */}
        <div className="flex items-center gap-3 mb-4">
          <MascotOwl
            mood="drinking"
            size="sm"
            speech="Hydration time! Gulp down pure water to keep your cells glowing!"
          />
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-fun font-bold text-[#3c3c3c] flex items-center gap-2">
            <Droplets className="w-5 h-5 text-[#1cb0f6] fill-[#1cb0f6]" />
            Log Standalone Water
          </h3>
          <p className="text-xs font-semibold text-gray-500">
            Keep your monthly water level surging! Pick bottles or sachets.
          </p>
        </div>

        <div className="space-y-3 mb-5">
          {/* Sachet Water */}
          <div className="p-3.5 rounded-2xl bg-[#eef9ff] border-2 border-[#bae6fd] border-b-4 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-sky-900">Sachet Water ("Pure Water")</div>
              <div className="text-xs text-sky-600 font-semibold">500ml pure sachet pack</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setSachets((p) => Math.max(0, p - 1));
                }}
                className="w-8 h-8 rounded-xl bg-white border border-gray-300 font-bold text-gray-600 flex items-center justify-center duo-btn"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center font-fun font-bold text-lg text-sky-900">
                {sachets}
              </span>
              <button
                type="button"
                onClick={() => {
                  sounds.playWaterDrop();
                  setSachets((p) => p + 1);
                }}
                className="w-8 h-8 rounded-xl bg-[#1cb0f6] border border-[#1899d6] font-bold text-white flex items-center justify-center duo-btn"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottle Water */}
          <div className="p-3.5 rounded-2xl bg-[#f0f9ff] border-2 border-[#bae6fd] border-b-4 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-sky-900">Bottle of Water</div>
              <div className="text-xs text-sky-600 font-semibold">750ml bottle</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setBottles((p) => Math.max(0, p - 1));
                }}
                className="w-8 h-8 rounded-xl bg-white border border-gray-300 font-bold text-gray-600 flex items-center justify-center duo-btn"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center font-fun font-bold text-lg text-sky-900">
                {bottles}
              </span>
              <button
                type="button"
                onClick={() => {
                  sounds.playWaterDrop();
                  setBottles((p) => p + 1);
                }}
                className="w-8 h-8 rounded-xl bg-[#1cb0f6] border border-[#1899d6] font-bold text-white flex items-center justify-center duo-btn"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50 text-center border border-blue-200">
            <span className="text-xs font-bold text-blue-900">
              Total hydration added: <span className="text-[#1cb0f6] font-fun text-sm">{totalLiters} Liters</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleQuickLog}
          className="w-full py-3.5 rounded-2xl font-bold text-white bg-[#1cb0f6] border-2 border-[#1899d6] border-b-4 hover:bg-[#2bbafc] transition-all duo-btn shadow-md flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{saving ? 'Logging Water...' : 'Drink Up & Log (+15 XP)'}</span>
        </button>
      </div>
    </div>
  );
};
