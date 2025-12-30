
import { Habit } from './types';

export const INITIAL_HABITS: Habit[] = [
  { id: '1', name: 'Wake up at 05:00', emoji: '⏰', goal: 30, category: 'Core' },
  { id: '2', name: 'Gym', emoji: '💪', goal: 20, category: 'Physical' },
  { id: '3', name: 'Reading / Learning', emoji: '📖', goal: 30, category: 'Mindset' },
  { id: '4', name: 'Day Planning', emoji: '🗓️', goal: 30, category: 'Core' },
  { id: '5', name: 'Budget Tracking', emoji: '💰', goal: 30, category: 'Lifestyle' },
  { id: '6', name: 'Project Work', emoji: '🎯', goal: 25, category: 'Lifestyle' },
  { id: '7', name: 'No Alcohol', emoji: '🍺', goal: 30, category: 'Physical' },
  { id: '8', name: 'Social Media Detox', emoji: '🌿', goal: 30, category: 'Mindset' },
  { id: '9', name: 'Goal Journaling', emoji: '📝', goal: 30, category: 'Mindset' },
  { id: '10', name: 'Cold Shower', emoji: '🚿', goal: 30, category: 'Physical' },
  { id: '11', name: 'Drink 2L Water', emoji: '💧', goal: 30, category: 'Physical' },
  { id: '12', name: 'Meditation', emoji: '🧘', goal: 20, category: 'Mindset' },
  { id: '13', name: 'Clean Desk', emoji: '🧹', goal: 30, category: 'Lifestyle' },
  { id: '14', name: 'No Sugar', emoji: '🍩', goal: 25, category: 'Physical' },
  { id: '15', name: 'Call Parents', emoji: '📞', goal: 4, category: 'Lifestyle' },
];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
