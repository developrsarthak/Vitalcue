export enum ViewState {
  HOME = 'HOME',
  DETOX = 'DETOX',
  CRISIS = 'CRISIS',
  MOOD = 'MOOD',
  CHALLENGE = 'CHALLENGE'
}

export enum ChallengeType {
  MATH = 'MATH',
  BREATHING = 'BREATHING',
  QR_SCAN = 'QR_SCAN',
  SIMPLE_CONFIRM = 'SIMPLE_CONFIRM'
}

export interface ActionCard {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g. "2 min"
  type: ChallengeType;
  completed: boolean;
  scoreImpact: number;
}

export interface UserStats {
  healthScore: number;
  streak: number;
  completedActions: number;
}

export interface UserProfile {
  name: string;
  onboardingComplete: boolean;
}

export interface MoodAnalysis {
  label: string;
  score: number; // 0-100
  advice: string;
}

export interface CrisisContent {
  step: number;
  instruction: string;
  totalSteps: number;
}