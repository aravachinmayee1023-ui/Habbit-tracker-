export interface DailyHabit {
  id: string;
  name: string;
  target: number;
  checks: boolean[]; // length 31
  color?: string;
}

export type MoodType = '😊 Happy' | '🥰 Loved' | '😌 Calm' | '😐 Okay' | '🥱 Tired' | '😢 Sad' | '😫 Stressed' | '';

export type WeatherType = '☀️ Sunny' | '⛅ P.Cloudy' | '☁️ Cloudy' | '🌧️ Rainy' | '⛈️ Stormy' | '🌬️ Windy' | '❄️ Snowy' | '';

export interface WellnessData {
  moods: MoodType[]; // length 31
  weather: WeatherType[]; // length 31
  sleepHours: (number | null)[]; // length 31
}

export interface WeeklyTaskItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface WeeklyBlock {
  weekNumber: number; // 1 to 5
  title: string;
  daysRange: string; // e.g. "Days 1–7"
  accentColor: string; // e.g. "#F472B6"
  darkFill: string; // e.g. "#3B2030"
  tasks: WeeklyTaskItem[];
}

export interface MonthlyGoalItem {
  id: string;
  title: string;
  category: string;
  completed: boolean;
}

export interface ReflectionData {
  nutritionalTiming: string;
  environmental: string;
  sleepRecovery: string;
  actionableAdjustments: string;
  monthlyWins: string;
  monthlyLearnings: string;
}

export interface HabitTrackerState {
  monthName: string; // e.g. "January"
  monthNumber: string; // e.g. "01"
  year: number; // e.g. 2027
  userName: string; // e.g. "Ava"
  greetingSubtext: string; // e.g. "Small steps, every day."
  habits: DailyHabit[];
  wellness: WellnessData;
  weeklyBlocks: WeeklyBlock[];
  monthlyGoals: MonthlyGoalItem[];
  extraTasks: WeeklyTaskItem[];
  reflection: ReflectionData;
}

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink?: string;
}
