import React from 'react';
import { Play, CheckCircle } from 'lucide-react';
import { ActionCard as ActionCardType } from '../types';
import { COLORS } from '../constants';

interface Props {
  action: ActionCardType;
  onStart: (action: ActionCardType) => void;
}

export const ActionCard: React.FC<Props> = ({ action, onStart }) => {
  return (
    <div className={`
      relative min-w-[280px] w-full p-5 rounded-2xl transition-all duration-300 transform 
      ${action.completed ? 'bg-green-50 border border-green-200' : 'bg-white shadow-md hover:shadow-lg hover:-translate-y-1'}
    `}>
      <div className="flex justify-between items-start mb-2">
        <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-md">
          {action.duration}
        </span>
        {action.completed && <CheckCircle size={20} className="text-green-500" />}
      </div>
      
      <h3 className="text-lg font-bold text-gray-800 mb-1">{action.title}</h3>
      <p className="text-sm text-gray-500 mb-4 h-10 overflow-hidden">{action.description}</p>
      
      <button
        onClick={() => !action.completed && onStart(action)}
        disabled={action.completed}
        className={`
          w-full py-3 rounded-xl flex items-center justify-center space-x-2 font-semibold transition-colors
          ${action.completed 
            ? 'bg-transparent text-green-600 cursor-default' 
            : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'}
        `}
        style={{ backgroundColor: action.completed ? 'transparent' : COLORS.primary }}
      >
        {action.completed ? (
          <span>Done</span>
        ) : (
          <>
            <Play size={16} fill="currentColor" />
            <span>Do This Now</span>
          </>
        )}
      </button>
    </div>
  );
};