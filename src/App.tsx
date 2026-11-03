import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { HabitTrackerState, MoodType, WeatherType, ReflectionData } from './types/habit';
import { INITIAL_HABIT_TRACKER_STATE } from './data/defaultData';
import { ExecutiveHeader } from './components/ExecutiveHeader';
import { DailyExecutionMatrix } from './components/DailyExecutionMatrix';
import { WellnessLayer } from './components/WellnessLayer';
import { AnalyticsDistributionHub } from './components/AnalyticsDistributionHub';
import { MultiHorizonTasks } from './components/MultiHorizonTasks';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { HabitSettingsModal } from './components/HabitSettingsModal';
import { initAuth, googleSignIn, logout, getAccessToken } from './services/firebaseAuth';
import { syncToExistingSheet } from './services/googleSheetsService';

const STORAGE_KEY = 'habit_tracker_pro_state_v1';
const LINKED_SHEET_KEY = 'habit_tracker_linked_sheet_v1';

export default function App() {
  const [state, setState] = useState<HabitTrackerState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read saved habit tracker state:', e);
    }
    return INITIAL_HABIT_TRACKER_STATE;
  });

  const [user, setUser] = useState<User | null>(null);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [connectedSpreadsheetUrl, setConnectedSpreadsheetUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LINKED_SHEET_KEY + '_url');
    } catch {
      return null;
    }
  });
  const [connectedSpreadsheetName, setConnectedSpreadsheetName] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LINKED_SHEET_KEY + '_name');
    } catch {
      return null;
    }
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show temporary toast notification
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 4000);
  }, []);

  // Save state to local storage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to persist state:', e);
    }
  }, [state]);

  // Save connected spreadsheet info
  const handleSetConnectedSpreadsheet = (url: string, name: string) => {
    setConnectedSpreadsheetUrl(url);
    setConnectedSpreadsheetName(name);
    try {
      localStorage.setItem(LINKED_SHEET_KEY + '_url', url);
      localStorage.setItem(LINKED_SHEET_KEY + '_name', name);
    } catch (e) {
      console.warn('Failed to persist linked sheet info:', e);
    }
    showToast(`Linked to: "${name}"`);
  };

  // Firebase auth initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (authedUser) => {
        setUser(authedUser);
      },
      () => {
        setUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setUser(res.user);
        showToast(`Signed in as ${res.user.displayName || res.user.email}`);
      }
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      showToast(err?.message || 'Google sign-in cancelled or failed');
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setUser(null);
      showToast('Signed out of Google account');
    } catch (err: any) {
      console.error('Sign-out failed:', err);
    }
  };

  // Quick sync current state to linked Google Sheet
  const handleQuickSync = async () => {
    if (!connectedSpreadsheetUrl) {
      setIsDriveModalOpen(true);
      return;
    }

    // Extract spreadsheetId from url
    const match = connectedSpreadsheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match || !match[1]) {
      showToast('Could not extract Spreadsheet ID from URL');
      return;
    }

    const spreadsheetId = match[1];
    setIsSyncing(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setIsDriveModalOpen(true);
        throw new Error('Please sign in with Google to sync');
      }

      await syncToExistingSheet(token, spreadsheetId, state);
      showToast('Successfully synced data to Google Sheets!');
    } catch (err: any) {
      console.error('Sync error:', err);
      showToast(err.message || 'Failed to sync with Google Sheets');
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle daily habit checkbox
  const handleToggleHabitCheck = (habitIndex: number, dayIndex: number) => {
    setState((prev) => {
      const updatedHabits = [...prev.habits];
      const targetHabit = { ...updatedHabits[habitIndex] };
      const newChecks = [...targetHabit.checks];
      newChecks[dayIndex] = !newChecks[dayIndex];
      targetHabit.checks = newChecks;
      updatedHabits[habitIndex] = targetHabit;
      return { ...prev, habits: updatedHabits };
    });
  };

  // Update wellness mood
  const handleUpdateMood = (dayIndex: number, mood: MoodType) => {
    setState((prev) => {
      const newMoods = [...prev.wellness.moods];
      newMoods[dayIndex] = mood;
      return {
        ...prev,
        wellness: { ...prev.wellness, moods: newMoods },
      };
    });
  };

  // Update wellness weather
  const handleUpdateWeather = (dayIndex: number, weather: WeatherType) => {
    setState((prev) => {
      const newWeather = [...prev.wellness.weather];
      newWeather[dayIndex] = weather;
      return {
        ...prev,
        wellness: { ...prev.wellness, weather: newWeather },
      };
    });
  };

  // Update wellness sleep hours
  const handleUpdateSleep = (dayIndex: number, hours: number | null) => {
    setState((prev) => {
      const newSleep = [...prev.wellness.sleepHours];
      newSleep[dayIndex] = hours;
      return {
        ...prev,
        wellness: { ...prev.wellness, sleepHours: newSleep },
      };
    });
  };

  // Toggle weekly task
  const handleToggleWeeklyTask = (weekNumber: number, taskId: string) => {
    setState((prev) => {
      const updatedBlocks = prev.weeklyBlocks.map((block) => {
        if (block.weekNumber === weekNumber) {
          const updatedTasks = block.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          );
          return { ...block, tasks: updatedTasks };
        }
        return block;
      });
      return { ...prev, weeklyBlocks: updatedBlocks };
    });
  };

  // Toggle monthly goal
  const handleToggleMonthlyGoal = (goalId: string) => {
    setState((prev) => {
      const updatedGoals = prev.monthlyGoals.map((g) =>
        g.id === goalId ? { ...g, completed: !g.completed } : g
      );
      return { ...prev, monthlyGoals: updatedGoals };
    });
  };

  // Toggle ad-hoc extra task
  const handleToggleExtraTask = (taskId: string) => {
    setState((prev) => {
      const updatedExtra = prev.extraTasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      return { ...prev, extraTasks: updatedExtra };
    });
  };

  // Update qualitative reflection note
  const handleUpdateReflection = (field: keyof ReflectionData, value: string) => {
    setState((prev) => ({
      ...prev,
      reflection: {
        ...prev.reflection,
        [field]: value,
      },
    }));
  };

  // Save settings modal
  const handleSaveSettings = (updated: Partial<HabitTrackerState>) => {
    setState((prev) => ({ ...prev, ...updated }));
    showToast('Tracker settings saved');
  };

  // Restore defaults
  const handleResetToDefaults = () => {
    setState(INITIAL_HABIT_TRACKER_STATE);
    showToast('Restored default 13 habits and blueprint setup');
  };

  return (
    <div className="min-h-screen bg-[#121214] text-[#F4F4F5] flex flex-col font-sans selection:bg-pink-500/30 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E1E24] text-zinc-200 border border-zinc-700 px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-pink-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Zone 1: Executive Header Zone */}
      <ExecutiveHeader
        state={state}
        user={user}
        onOpenGoogleDrive={() => setIsDriveModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        connectedSpreadsheetUrl={connectedSpreadsheetUrl}
        connectedSpreadsheetName={connectedSpreadsheetName}
        isSyncing={isSyncing}
        onQuickSync={handleQuickSync}
      />

      {/* Main Dashboard Canvas Body */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-3 sm:px-6 py-6">
        {/* Zone 2: Daily Habit Execution Matrix & Growth Visualizer */}
        <DailyExecutionMatrix
          habits={state.habits}
          onToggleHabitCheck={handleToggleHabitCheck}
        />

        {/* Zone 3: Wellness & Chronobiological Tracking Layer */}
        <WellnessLayer
          wellness={state.wellness}
          onUpdateMood={handleUpdateMood}
          onUpdateWeather={handleUpdateWeather}
          onUpdateSleep={handleUpdateSleep}
        />

        {/* Zone 4: Analytical Distribution Hub & Qualitative Reflection */}
        <AnalyticsDistributionHub
          wellness={state.wellness}
          reflection={state.reflection}
          onUpdateReflection={handleUpdateReflection}
        />

        {/* Zone 5: Multi-Horizon Task Management Tier */}
        <MultiHorizonTasks
          weeklyBlocks={state.weeklyBlocks}
          monthlyGoals={state.monthlyGoals}
          extraTasks={state.extraTasks}
          onToggleWeeklyTask={handleToggleWeeklyTask}
          onToggleMonthlyGoal={handleToggleMonthlyGoal}
          onToggleExtraTask={handleToggleExtraTask}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-[#101012] py-4 px-6 text-center text-xs text-zinc-500">
        <span>Dark-Mode Habit Tracker Pro &bull; Google Drive & Google Sheets Synchronized Operational Dashboard</span>
      </footer>

      {/* Google Drive Integration Modal */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        user={user}
        onSignIn={handleSignIn}
        getAccessToken={getAccessToken}
        state={state}
        connectedSpreadsheetUrl={connectedSpreadsheetUrl}
        connectedSpreadsheetName={connectedSpreadsheetName}
        onSetConnectedSpreadsheet={handleSetConnectedSpreadsheet}
      />

      {/* Settings Modal */}
      <HabitSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        state={state}
        onSaveSettings={handleSaveSettings}
        onResetToDefaults={handleResetToDefaults}
      />
    </div>
  );
}
