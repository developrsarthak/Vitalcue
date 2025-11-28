import React, { useState } from 'react';
import { ArrowRight, Activity } from 'lucide-react';

interface Props {
  onComplete: (name: string) => void;
}

export const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [isExiting, setIsExiting] = useState(false);

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
    } else {
      if (!name.trim()) return;
      setIsExiting(true);
      setTimeout(() => onComplete(name), 500);
    }
  };

  return (
    <div className={`fixed inset-0 bg-blue-600 flex flex-col items-center justify-center p-8 z-50 transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 w-full max-w-md">
        {step === 0 ? (
          <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-xl border border-white/30">
              <Activity className="text-white w-12 h-12" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white tracking-tight">VitalCue</h1>
              <p className="text-blue-100 text-lg">Daily micro-actions. Irreversible habits.</p>
            </div>

            <button 
              onClick={handleNext}
              className="mt-12 group flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-start space-y-6 w-full animate-in fade-in slide-in-from-right-10 duration-500">
            <h2 className="text-3xl font-bold text-white">What should we call you?</h2>
            
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full bg-transparent border-b-2 border-white/50 text-white text-3xl pb-2 focus:outline-none focus:border-white placeholder-blue-300/50 transition-colors"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            />

            <p className="text-blue-200 text-sm">We use this to personalize your daily cues.</p>

            <button 
              onClick={handleNext}
              disabled={!name.trim()}
              className="self-end mt-8 flex items-center justify-center w-14 h-14 bg-white rounded-full text-blue-600 shadow-lg disabled:opacity-50 disabled:scale-95 hover:scale-110 transition-all"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
      
      {/* Indicator */}
      <div className="absolute bottom-8 flex space-x-2">
        <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 0 ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} />
        <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} />
      </div>
    </div>
  );
};