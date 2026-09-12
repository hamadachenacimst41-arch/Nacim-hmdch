import React from 'react';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  showBreakdown?: boolean;
  color?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 170,
  strokeWidth = 14,
  label = 'Avancement Global',
  sublabel = 'Travaux Chantier',
  color = '#f59e0b', // amber-500
}) => {
  const clampedPct = Math.min(100, Math.max(0, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center p-2">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 filter drop-shadow-md"
      >
        {/* Background Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-800"
        />

        {/* Gradient Definition */}
        <defs>
          <linearGradient id="circularGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" /> {/* amber-500 */}
            <stop offset="60%" stopColor="#10b981" /> {/* emerald-500 */}
            <stop offset="100%" stopColor="#06b6d4" /> {/* cyan-500 */}
          </linearGradient>
        </defs>

        {/* Animated Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#circularGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Center Percentage Display */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-black text-white font-mono tracking-tight drop-shadow-sm">
          {clampedPct.toFixed(1)}%
        </span>
        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider mt-0.5">
          {clampedPct >= 100 ? 'Terminé' : clampedPct > 0 ? 'En cours' : 'Non débuté'}
        </span>
      </div>

      {label && (
        <div className="text-center mt-2.5">
          <div className="text-xs font-bold text-slate-200">{label}</div>
          {sublabel && <div className="text-[11px] text-slate-400">{sublabel}</div>}
        </div>
      )}
    </div>
  );
};
