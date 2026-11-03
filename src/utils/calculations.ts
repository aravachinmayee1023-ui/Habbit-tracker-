import { DailyHabit, MoodType, WeatherType } from '../types/habit';

/**
 * Sums all active Boolean checkboxes for a habit row.
 * Corresponding formula: =COUNTIF(C15:AG15, TRUE)
 */
export function calculateCompletedDays(checks: boolean[]): number {
  return checks.reduce((count, val) => (val ? count + 1 : count), 0);
}

/**
 * Calculates completion percentage.
 * Corresponding formula: =IFERROR(AI15 / AH15, 0)
 */
export function calculateCompletionRate(completed: number, target: number): number {
  if (!target || target <= 0) return 0;
  return Math.min(1, Math.max(0, completed / target));
}

/**
 * Evaluates unbroken chain of completed days.
 * In the spreadsheet blueprint:
 * =IFERROR(COLUMNS(C15:AG15) - MAX(FILTER(COLUMN(C15:AG15) - COLUMN(C15) + 1, C15:AG15 = FALSE)), COUNTIF(C15:AG15, TRUE))
 * If the current latest day evaluated has consecutive trues, counts backwards.
 * Also supports active streak up to the latest checked day.
 */
export function calculateActiveStreak(checks: boolean[]): number {
  const total = checks.length;
  if (total === 0) return 0;

  // Find the last day index that has been marked TRUE
  let lastCheckedIndex = -1;
  for (let i = total - 1; i >= 0; i--) {
    if (checks[i]) {
      lastCheckedIndex = i;
      break;
    }
  }

  if (lastCheckedIndex === -1) return 0;

  // Count backwards from lastCheckedIndex
  let streak = 0;
  for (let i = lastCheckedIndex; i >= 0; i--) {
    if (checks[i]) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Pine Tree Visualizer Engine
 * Corresponding formula:
 * =IFS(C28=0, "", C28<=4, "🌱", C28<=8, "🌲", C28<=11, "🌳", C28>11, "🌴")
 */
export function getPineTreeStage(completedCount: number): string {
  if (completedCount <= 0) return '';
  if (completedCount <= 4) return '🌱';
  if (completedCount <= 8) return '🌲';
  if (completedCount <= 11) return '🌳';
  return '🌴';
}

export interface SleepClassification {
  category: 'optimal' | 'caution' | 'deficit' | 'empty';
  bgColor: string;
  textColor: string;
  label: string;
}

/**
 * Chronobiological feedback classification
 * Optimal Sleep Zone (>= 7.0h): #133E2B (Dark Emerald), #4ADE80 (Mint Green)
 * Sub-Optimal Caution Zone (6.0h <= x < 7.0h): #3D3214 (Dark Amber), #FBBF24 (Amber Yellow)
 * Sleep Deficit Recovery Zone (< 6.0h): #3E1A1A (Dark Wine), #F87171 (Coral Red)
 */
export function getSleepClassification(hours: number | null | undefined): SleepClassification {
  if (hours === null || hours === undefined || isNaN(hours)) {
    return {
      category: 'empty',
      bgColor: 'transparent',
      textColor: '#A1A1AA',
      label: 'Unlogged',
    };
  }

  if (hours >= 7.0) {
    return {
      category: 'optimal',
      bgColor: '#133E2B',
      textColor: '#4ADE80',
      label: 'Optimal (≥7.0h)',
    };
  }

  if (hours >= 6.0) {
    return {
      category: 'caution',
      bgColor: '#3D3214',
      textColor: '#FBBF24',
      label: 'Caution (6.0-6.9h)',
    };
  }

  return {
    category: 'deficit',
    bgColor: '#3E1A1A',
    textColor: '#F87171',
    label: 'Deficit (<6.0h)',
  };
}

/**
 * Daily Task Count Row across all habits for each day.
 * Formula: =COUNTIF(C15:C27, TRUE)
 */
export function calculateDailyTotals(habits: DailyHabit[], dayCount: number = 31): number[] {
  const totals: number[] = new Array(dayCount).fill(0);
  for (let day = 0; day < dayCount; day++) {
    let daySum = 0;
    for (const habit of habits) {
      if (habit.checks[day]) {
        daySum++;
      }
    }
    totals[day] = daySum;
  }
  return totals;
}

/**
 * Weekly Cluster Completion:
 * =COUNTIF(C15:I27, TRUE) / (13 * 7)
 */
export function calculateWeeklyRate(
  habits: DailyHabit[],
  startDayZeroIndexed: number,
  endDayZeroIndexed: number
): number {
  if (!habits.length) return 0;
  const daysInRange = endDayZeroIndexed - startDayZeroIndexed + 1;
  const totalSlots = habits.length * daysInRange;
  if (totalSlots === 0) return 0;

  let completedSlots = 0;
  for (const habit of habits) {
    for (let d = startDayZeroIndexed; d <= endDayZeroIndexed; d++) {
      if (habit.checks[d]) {
        completedSlots++;
      }
    }
  }

  return completedSlots / totalSlots;
}

/**
 * Macro Daily KPI Gauge:
 * =SUM(AI15:AI27) / SUM(AH15:AH27)
 */
export function calculateMacroDailyCompletion(habits: DailyHabit[]): number {
  if (!habits.length) return 0;
  let totalDone = 0;
  let totalTarget = 0;
  for (const habit of habits) {
    totalDone += calculateCompletedDays(habit.checks);
    totalTarget += habit.target;
  }
  return totalTarget > 0 ? totalDone / totalTarget : 0;
}

/**
 * Sleep Stats Summary
 */
export function calculateSleepStats(sleepHours: (number | null)[]): {
  average: number;
  optimalDays: number;
  populatedDays: number;
} {
  const valid = sleepHours.filter((h): h is number => h !== null && !isNaN(h));
  if (valid.length === 0) {
    return { average: 0, optimalDays: 0, populatedDays: 0 };
  }
  const sum = valid.reduce((acc, v) => acc + v, 0);
  const optimalDays = valid.filter((v) => v >= 7.0).length;
  return {
    average: Math.round((sum / valid.length) * 10) / 10,
    optimalDays,
    populatedDays: valid.length,
  };
}

/**
 * Mood Frequencies
 */
export function calculateMoodFrequencies(moods: MoodType[]): Record<string, number> {
  const counts: Record<string, number> = {
    '😊 Happy': 0,
    '🥰 Loved': 0,
    '😌 Calm': 0,
    '😐 Okay': 0,
    '🥱 Tired': 0,
    '😢 Sad': 0,
    '😫 Stressed': 0,
  };

  for (const m of moods) {
    if (m && counts[m] !== undefined) {
      counts[m]++;
    }
  }

  return counts;
}

/**
 * Weather Frequencies
 */
export function calculateWeatherFrequencies(weather: WeatherType[]): Record<string, number> {
  const counts: Record<string, number> = {
    '☀️ Sunny': 0,
    '⛅ P.Cloudy': 0,
    '☁️ Cloudy': 0,
    '🌧️ Rainy': 0,
    '⛈️ Stormy': 0,
    '🌬️ Windy': 0,
    '❄️ Snowy': 0,
  };

  for (const w of weather) {
    if (w && counts[w] !== undefined) {
      counts[w]++;
    }
  }

  return counts;
}

/**
 * Longest Streak across all habits
 */
export function findLongestStreak(habits: DailyHabit[]): number {
  let max = 0;
  for (const habit of habits) {
    const streak = calculateActiveStreak(habit.checks);
    if (streak > max) max = streak;
  }
  return max;
}

/**
 * Perfect Completion Days: days where ALL habits were checked
 */
export function calculatePerfectDays(habits: DailyHabit[], dayCount: number = 31): number {
  if (!habits.length) return 0;
  let perfectCount = 0;
  for (let day = 0; day < dayCount; day++) {
    const allChecked = habits.every((h) => h.checks[day]);
    if (allChecked) perfectCount++;
  }
  return perfectCount;
}
