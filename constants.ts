import { ChartColumn, Home, ShieldAlert, Timer, Smile } from 'lucide-react';
import { ChallengeType } from './types';

export const COLORS = {
  primary: '#0F6BFF', // Energetic Blue
  accent: '#00C853',  // Healthy Green
  bg: '#F7FAFF',
  text: '#0F1724',
  error: '#FF5252'
};

export const NAV_ITEMS = [
  { id: 'HOME', icon: Home, label: 'Today' },
  { id: 'DETOX', icon: Timer, label: 'Detox' },
  { id: 'MOOD', icon: Smile, label: 'Mood' },
  { id: 'CRISIS', icon: ShieldAlert, label: 'Crisis' },
];

export const MOCK_INITIAL_ACTIONS = [
  {
    id: '1',
    title: 'Morning Hydration',
    description: 'Drink a full glass of water immediately.',
    duration: '1 min',
    type: ChallengeType.SIMPLE_CONFIRM,
    completed: false,
    scoreImpact: 5
  },
  {
    id: '2',
    title: 'Wake Up Math',
    description: 'Solve 3 simple problems to activate your brain.',
    duration: '2 min',
    type: ChallengeType.MATH,
    completed: false,
    scoreImpact: 10
  },
  {
    id: '3',
    title: 'Box Breathing',
    description: '4-4-4-4 breathing pattern for focus.',
    duration: '3 min',
    type: ChallengeType.BREATHING,
    completed: false,
    scoreImpact: 8
  }
];