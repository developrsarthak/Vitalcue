import React, { useEffect, useState } from 'react';
import { COLORS } from '../constants';

interface Props {
  score: number;
}

export const HealthScoreRing: React.FC<Props> = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = 65; // Slightly larger
  const stroke = 14;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  useEffect(() => {
    const duration = 1000;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.floor(score * easeOut(progress)));
      if (progress < 1) requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }, [score]);

  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      {/* SVG Definitions for Gradient */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>

      <div className="relative w-48 h-48">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90 origin-center w-full h-full drop-shadow-xl"
        >
          {/* Background Ring */}
          <circle
            stroke="#F1F5F9"
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress Ring */}
          <circle
            stroke="url(#scoreGradient)"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-out' }}
            strokeLinecap="round"
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-black text-gray-800 tracking-tighter">{displayScore}</span>
          <span className="text-xs font-bold text-gray-400 tracking-widest mt-1">VITALITY</span>
        </div>
      </div>
    </div>
  );
};