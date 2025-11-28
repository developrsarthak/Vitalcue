import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { ActionCard, ChallengeType } from '../types';
import { COLORS } from '../constants';

interface Props {
  action: ActionCard;
  onComplete: () => void;
  onClose: () => void;
}

export const ChallengeModal: React.FC<Props> = ({ action, onComplete, onClose }) => {
  const [step, setStep] = useState(0);
  const [mathAnswer, setMathAnswer] = useState('');
  const [breathingText, setBreathingText] = useState('Inhale');

  // Math Challenge State
  const [problem] = useState(() => {
    const a = Math.floor(Math.random() * 20) + 10;
    const b = Math.floor(Math.random() * 20) + 5;
    return { a, b, ans: a + b };
  });

  // Breathing Challenge Logic
  useEffect(() => {
    if (action.type === ChallengeType.BREATHING) {
      let phase = 0;
      const phases = ['Inhale (4s)', 'Hold (4s)', 'Exhale (4s)', 'Hold (4s)'];
      
      const interval = setInterval(() => {
        phase = (phase + 1) % 4;
        setBreathingText(phases[phase]);
        setStep(prev => prev + 1); // Mock progress
      }, 4000);

      const timeout = setTimeout(() => {
          onComplete();
      }, 16000); // 16 seconds cycle for demo

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      }
    }
  }, [action.type, onComplete]);

  const handleMathSubmit = () => {
    if (parseInt(mathAnswer) === problem.ans) {
      onComplete();
    } else {
      alert("Try again!");
      setMathAnswer('');
    }
  };

  const renderContent = () => {
    switch (action.type) {
      case ChallengeType.MATH:
        return (
          <div className="flex flex-col items-center space-y-6">
            <h3 className="text-4xl font-bold text-gray-800">{problem.a} + {problem.b} = ?</h3>
            <input 
              type="number" 
              value={mathAnswer}
              onChange={(e) => setMathAnswer(e.target.value)}
              className="w-full text-center text-2xl p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
              placeholder="?"
              autoFocus
            />
            <button 
              onClick={handleMathSubmit}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700"
            >
              Verify
            </button>
          </div>
        );
      
      case ChallengeType.BREATHING:
        return (
          <div className="flex flex-col items-center justify-center py-10">
            <div className={`
              w-48 h-48 rounded-full flex items-center justify-center text-xl font-bold text-white transition-all duration-[4000ms]
              ${breathingText.includes('Inhale') || breathingText.includes('Hold') ? 'scale-110 bg-blue-400' : 'scale-90 bg-green-500'}
            `}>
              {breathingText}
            </div>
            <p className="mt-8 text-gray-500">Follow the rhythm...</p>
          </div>
        );

      default: // Simple Confirm
        return (
          <div className="flex flex-col items-center space-y-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <Check className="text-blue-600 w-10 h-10" />
            </div>
            <p className="text-center text-gray-600">Have you completed: <b>{action.title}</b>?</p>
            <button 
              onClick={onComplete}
              className="w-full py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 shadow-lg shadow-green-200"
            >
              Yes, I did it!
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative overflow-hidden shadow-2xl">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
        >
          <X size={20} className="text-gray-500" />
        </button>
        
        <div className="mb-6">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">Challenge Mode</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">{action.title}</h2>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};