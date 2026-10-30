import React from 'react';

export type MascotMood = 'happy' | 'cheering' | 'drinking' | 'thinking' | 'proud';

interface MascotOwlProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg';
  speech?: string;
  className?: string;
}

export const MascotOwl: React.FC<MascotOwlProps> = ({
  mood = 'happy',
  size = 'md',
  speech,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
  };

  return (
    <div className={`relative flex items-center gap-3 ${className}`}>
      {/* Playful Owl SVG */}
      <div className={`relative ${sizeMap[size]} shrink-0 transition-transform duration-300 hover:scale-105 select-none`}>
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
          {/* Owl Body - Duolingo Green */}
          <ellipse cx="60" cy="65" rx="42" ry="46" fill="#58cc02" />
          <ellipse cx="60" cy="65" rx="42" ry="46" stroke="#46a302" strokeWidth="4" />

          {/* Belly - Soft Cream / Light Green */}
          <ellipse cx="60" cy="74" rx="26" ry="30" fill="#d7ffb8" />

          {/* Belly Feather Feathers detail */}
          <path d="M52 68 Q60 74 68 68" stroke="#8ee000" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M54 78 Q60 84 66 78" stroke="#8ee000" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Owl Ears / Feathers */}
          <path d="M26 30 L40 45 L25 50 Z" fill="#58cc02" stroke="#46a302" strokeWidth="3" strokeLinejoin="round" />
          <path d="M94 30 L80 45 L95 50 Z" fill="#58cc02" stroke="#46a302" strokeWidth="3" strokeLinejoin="round" />

          {/* Big Owl Eyes */}
          <circle cx="44" cy="50" r="16" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2" />
          <circle cx="76" cy="50" r="16" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2" />

          {/* Pupils according to mood */}
          {mood === 'cheering' ? (
            <>
              {/* Happy squint eyes ^ ^ */}
              <path d="M37 53 Q44 43 51 53" stroke="#2b3b00" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M69 53 Q76 43 83 53" stroke="#2b3b00" strokeWidth="4" strokeLinecap="round" fill="none" />
            </>
          ) : mood === 'thinking' ? (
            <>
              <circle cx="46" cy="46" r="7" fill="#2b3b00" />
              <circle cx="78" cy="46" r="7" fill="#2b3b00" />
              <circle cx="48" cy="44" r="2.5" fill="#ffffff" />
              <circle cx="80" cy="44" r="2.5" fill="#ffffff" />
            </>
          ) : mood === 'drinking' ? (
            <>
              {/* Joyful closed wink */}
              <circle cx="44" cy="50" r="7" fill="#2b3b00" />
              <circle cx="46" cy="48" r="2.5" fill="#ffffff" />
              <path d="M69 53 Q76 45 83 53" stroke="#2b3b00" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              {/* Default curious bright eyes */}
              <circle cx="44" cy="51" r="7.5" fill="#2b3b00" />
              <circle cx="76" cy="51" r="7.5" fill="#2b3b00" />
              <circle cx="47" cy="48" r="2.5" fill="#ffffff" />
              <circle cx="79" cy="48" r="2.5" fill="#ffffff" />
            </>
          )}

          {/* Cute Orange Beak */}
          <path d="M54 58 L66 58 L60 70 Z" fill="#ff9600" stroke="#e07b00" strokeWidth="2" strokeLinejoin="round" />

          {/* Rosy Cheeks */}
          <circle cx="30" cy="62" r="5" fill="#ff7f7f" opacity="0.4" />
          <circle cx="90" cy="62" r="5" fill="#ff7f7f" opacity="0.4" />

          {/* Wings */}
          {mood === 'cheering' ? (
            <>
              {/* Raised wings */}
              <path d="M22 65 C12 50 14 36 28 44 C26 55 24 64 22 65 Z" fill="#46a302" stroke="#357d00" strokeWidth="2.5" />
              <path d="M98 65 C108 50 106 36 92 44 C94 55 96 64 98 65 Z" fill="#46a302" stroke="#357d00" strokeWidth="2.5" />
            </>
          ) : mood === 'drinking' ? (
            <>
              {/* Wing holding water bottle / sachet */}
              <path d="M22 62 C16 68 18 82 28 85 C26 78 24 70 22 62 Z" fill="#46a302" />
              {/* Pure water sachet or bottle */}
              <rect x="76" y="60" width="16" height="24" rx="4" fill="#1cb0f6" stroke="#0092d6" strokeWidth="2" />
              <rect x="80" y="56" width="8" height="4" rx="1.5" fill="#00e5ff" />
              <text x="84" y="76" fontSize="10" textAnchor="middle" fill="#ffffff" fontWeight="bold">H₂O</text>
            </>
          ) : (
            <>
              <path d="M20 62 C15 72 18 84 26 88 C25 80 23 70 20 62 Z" fill="#46a302" stroke="#357d00" strokeWidth="2" />
              <path d="M100 62 C105 72 102 84 94 88 C95 80 97 70 100 62 Z" fill="#46a302" stroke="#357d00" strokeWidth="2" />
            </>
          )}

          {/* Cute Little Orange Feet */}
          <path d="M46 108 C46 113 40 115 44 116 C48 116 50 113 50 108" fill="#ff9600" stroke="#e07b00" strokeWidth="2" />
          <path d="M70 108 C70 113 74 115 70 116 C66 116 64 113 64 108" fill="#ff9600" stroke="#e07b00" strokeWidth="2" />

          {/* Chef Hat Accessory */}
          <path d="M45 28 C45 20 52 14 60 14 C68 14 75 20 75 28 Z" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2" />
          <path d="M42 27 H78 V33 H42 Z" fill="#ff4b4b" rx="2" />
          <circle cx="60" cy="12" r="6" fill="#ffffff" />
        </svg>
      </div>

      {/* Comic Speech Bubble */}
      {speech && (
        <div className="relative bg-white border-2 border-[#e5e7eb] border-b-4 rounded-2xl px-4 py-2.5 shadow-sm max-w-xs text-sm font-semibold text-[#3c3c3c]">
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-3 h-3 bg-white border-b-2 border-l-2 border-[#e5e7eb] -rotate-45" />
          {speech}
        </div>
      )}
    </div>
  );
};
