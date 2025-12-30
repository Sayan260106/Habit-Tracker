
export interface Habit {
  id: string;
  name: string;
  emoji: string;
  goal: number; // target days per month
  category?: 'Core' | 'Physical' | 'Mindset' | 'Lifestyle';
}

export type CompletionData = Record<string, boolean[]>; // habitId -> array of booleans for each day

export interface MonthStats {
  totalHabits: number;
  completedTasks: number;
  progressPercent: number;
}
