import React from 'react';
import { User } from 'firebase/auth';
import {
  calculateMacroDailyCompletion,
  calculateSleepStats,
  calculateMoodFrequencies,
  findLongestStreak,
  calculatePerfectDays,
} from '../utils/calculations';
import { HabitTrackerState } from '../types/habit';
import {
  Sparkles,
  Calendar,
  Cloud,
  FileSpreadsheet,
  Settings,
  Share2,
  ExternalLink,
  CheckCircle2,
  Moon,
  Flame,
  Award,
  RefreshCw,
  LogOut,
} from 'lucide-react';

interface ExecutiveHeaderProps {
  state: HabitTrackerState;
  user: User | null;
  onOpenGoogleDrive: () => void;
  onOpenSettings: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  connectedSpreadsheetUrl: string | null;
  connectedSpreadsheetName: string | null;
  isSyncing: boolean;
  onQuickSync: () => void;
}

export const ExecutiveHeader: React.FC<ExecutiveHeaderProps> = ({
  state,
  user,
  onOpenGoogleDrive,
  onOpenSettings,
  onSignIn,
  onSignOut,
  connectedSpreadsheetUrl,
  connectedSpreadsheetName,
  isSyncing,
  onQuickSync,
}) => {
  // KPI Calculations
  const dailyRate = calculateMacroDailyCompletion(state.habits);
  
  // Weekly rate across 5 cards
  let totalWeeklyTasks = 0;
  let doneWeeklyTasks = 0;
  state.weeklyBlocks.forEach((w) => {
    w.tasks.forEach((t) => {
      totalWeeklyTasks++;
      if (t.completed) doneWeeklyTasks++;
    });
  });
  const weeklyRate = totalWeeklyTasks > 0 ? doneWeeklyTasks / totalWeeklyTasks : 0;

  // Monthly goals rate
  const monthlyTotal = state.monthlyGoals.length;
  const monthlyDone = state.monthlyGoals.filter((g) => g.completed).length;
  const monthlyRate = monthlyTotal > 0 ? monthlyDone / monthlyTotal : 0;

  // Chronobiological & mood summaries
  const sleepStats = calculateSleepStats(state.wellness.sleepHours);
  const moodFreqs = calculateMoodFrequencies(state.wellness.moods);
  const happyCount = moodFreqs['😊 Happy'] || 0;
  const longestStreak = findLongestStreak(state.habits);
  const perfectDays = calculatePerfectDays(state.habits, 31);

  // SVG Circular Gauge helper
  const renderGauge = (percentage: number, color: string, label: string, sublabel: string) => {
    const radius = 34;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - percentage * circumference;

    return (
      <div className="flex items-center gap-3 bg-[#18181D] px-3.5 py-2.5 rounded-xl border border-zinc-800/80 shadow-sm">
        <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
          <svg className="w-16 h-16 -rotate-90 transform">
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="#27272A"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke={color}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-[#F4F4F5]">
            {Math.round(percentage * 100)}%
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-[#F4F4F5] uppercase tracking-wider">{label}</span>
          <span className="text-[10px] text-[#A1A1AA]">{sublabel}</span>
        </div>
      </div>
    );
  };

  return (
    <header className="w-full bg-[#1E1E24] border-b border-zinc-800/80 px-4 lg:px-6 py-4">
      {/* Top Bar: Temporal Metadata & User / Google Workspace Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#A1A1AA] mb-1">
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-pink-950/60 text-pink-400 border border-pink-800/40 font-mono text-[11px]">
              {state.monthNumber}
            </span>
            <span className="text-zinc-500">/</span>
            <span className="text-zinc-200 tracking-widest">{state.monthName.toUpperCase()} {state.year}</span>
            <span className="text-zinc-500">/</span>
            <span className="text-pink-400 font-bold">MY HABIT JOURNEY PRO</span>
          </div>
          <h1 className="text-lg lg:text-xl font-bold text-[#F4F4F5] flex items-center gap-2">
            <span>Hi, {state.userName}!</span>
            <span className="text-sm font-normal text-[#A1A1AA]">{state.greetingSubtext}</span>
          </h1>
        </div>

        {/* Integration and Account Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {connectedSpreadsheetUrl ? (
            <div className="flex items-center gap-2 bg-[#121214] border border-emerald-900/60 rounded-lg px-3 py-1.5 text-xs text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="truncate max-w-[140px] text-zinc-200 font-medium" title={connectedSpreadsheetName || 'Google Sheet'}>
                {connectedSpreadsheetName || 'Linked Sheet'}
              </span>
              <button
                onClick={onQuickSync}
                disabled={isSyncing}
                title="Sync latest tracker changes to Google Sheets"
                className="p-1 hover:bg-zinc-800 rounded text-emerald-400 transition flex items-center gap-1"
                aria-label="Sync with Google Sheets"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
              <a
                href={connectedSpreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition"
                title="Open directly in Google Sheets"
                aria-label="Open sheet in Google Sheets"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : null}

          {/* Google Sheets / Drive Hub Button */}
          <button
            onClick={onOpenGoogleDrive}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#133E2B] text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900/70 transition shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google Drive & Sheets</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
            title="Configure Habits & Metadata"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400" />
            <span>Setup</span>
          </button>

          {/* User Sign-In / Account status */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-7 h-7 rounded-full border border-zinc-700"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-pink-900/80 text-pink-300 flex items-center justify-center font-bold text-xs">
                  {user.displayName ? user.displayName.charAt(0) : 'U'}
                </div>
              )}
              <div className="hidden sm:flex flex-col">
                <span className="text-[11px] font-medium text-zinc-200 truncate max-w-[100px]">
                  {user.displayName || user.email}
                </span>
                <span className="text-[9px] text-emerald-400">Connected</span>
              </div>
              <button
                onClick={onSignOut}
                className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-400 transition"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="flex items-center gap-2 px-3 py-1.5 bg-white text-zinc-800 hover:bg-zinc-100 rounded-lg text-xs font-medium transition shadow"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          )}
        </div>
      </div>

      {/* Middle Row: 3 Macro Percentage Gauges & Summary Performance Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
        {/* Gauge 1: Daily Habits */}
        {renderGauge(dailyRate, '#F472B6', 'Daily Habits', '403 Matrix Target')}
        {/* Gauge 2: Weekly Routines */}
        {renderGauge(weeklyRate, '#FB923C', 'Weekly Tasks', `${doneWeeklyTasks}/${totalWeeklyTasks} done`)}
        {/* Gauge 3: Monthly Goals */}
        {renderGauge(monthlyRate, '#38BDF8', 'Monthly Goals', `${monthlyDone}/${monthlyTotal} achieved`)}

        {/* Metric Card 1: Mood of the Month */}
        <div className="bg-[#18181D] px-3.5 py-2.5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-[#A1A1AA] uppercase font-semibold">
            <span>Mood of Month</span>
            <span className="text-yellow-400">😊</span>
          </div>
          <div className="my-1">
            <span className="text-base font-bold text-[#F4F4F5]">{happyCount} of 31</span>
            <span className="text-xs text-[#A1A1AA] ml-1">days happy</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">Predominant state</span>
        </div>

        {/* Metric Card 2: Chronobiological Sleep */}
        <div className="bg-[#18181D] px-3.5 py-2.5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-[#A1A1AA] uppercase font-semibold">
            <span>Mean Sleep</span>
            <Moon className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="my-1">
            <span className="text-base font-bold text-emerald-400">{sleepStats.average}h</span>
            <span className="text-xs text-[#A1A1AA] ml-1">avg / night</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">{sleepStats.optimalDays} days ≥ 7.0h (Focus Zone)</span>
        </div>

        {/* Metric Card 3: Longest Habit Streak & Perfect Days */}
        <div className="bg-[#18181D] px-3.5 py-2.5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-[#A1A1AA] uppercase font-semibold">
            <span>Active Streaks</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="my-1 flex items-baseline gap-2">
            <span className="text-base font-bold text-amber-300">{longestStreak}d</span>
            <span className="text-xs text-[#A1A1AA]">max streak</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-medium">{perfectDays} perfect (13/13) days</span>
        </div>
      </div>
    </header>
  );
};
