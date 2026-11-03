import React, { useState } from 'react';
import { HabitTrackerState } from '../types/habit';
import { X, Settings, Check, RefreshCw } from 'lucide-react';

interface HabitSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: HabitTrackerState;
  onSaveSettings: (updated: Partial<HabitTrackerState>) => void;
  onResetToDefaults: () => void;
}

export const HabitSettingsModal: React.FC<HabitSettingsModalProps> = ({
  isOpen,
  onClose,
  state,
  onSaveSettings,
  onResetToDefaults,
}) => {
  const [userName, setUserName] = useState(state.userName);
  const [greetingSubtext, setGreetingSubtext] = useState(state.greetingSubtext);
  const [monthName, setMonthName] = useState(state.monthName);
  const [monthNumber, setMonthNumber] = useState(state.monthNumber);
  const [year, setYear] = useState(state.year);
  const [habitNames, setHabitNames] = useState(state.habits.map((h) => h.name));

  if (!isOpen) return null;

  const handleSave = () => {
    const updatedHabits = state.habits.map((h, i) => ({
      ...h,
      name: habitNames[i] || h.name,
    }));

    onSaveSettings({
      userName,
      greetingSubtext,
      monthName,
      monthNumber,
      year: Number(year),
      habits: updatedHabits,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1E1E24] border border-zinc-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 lg:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-pink-950/80 text-pink-400 border border-pink-800/60">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F4F4F5]">Customize Tracker Setup</h3>
              <p className="text-xs text-[#A1A1AA]">Edit profile greeting, calendar month, and 13 daily routines</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 lg:p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* Section 1: User & Temporal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1">User Greeting Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-[#121214] text-xs text-[#F4F4F5] p-2 rounded-lg border border-zinc-800 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Greeting Subtext</label>
              <input
                type="text"
                value={greetingSubtext}
                onChange={(e) => setGreetingSubtext(e.target.value)}
                className="w-full bg-[#121214] text-xs text-[#F4F4F5] p-2 rounded-lg border border-zinc-800 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Target Month</label>
              <input
                type="text"
                value={monthName}
                onChange={(e) => setMonthName(e.target.value)}
                className="w-full bg-[#121214] text-xs text-[#F4F4F5] p-2 rounded-lg border border-zinc-800 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-[#121214] text-xs text-[#F4F4F5] p-2 rounded-lg border border-zinc-800 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Section 2: 13 Daily Habit Names */}
          <div className="pt-3 border-t border-zinc-800">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-2">
              13 Daily Habit Routines Inventory
            </span>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
              {habitNames.map((name, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-zinc-500 w-6 text-right">
                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const updated = [...habitNames];
                      updated[idx] = e.target.value;
                      setHabitNames(updated);
                    }}
                    className="flex-1 bg-[#121214] text-xs text-[#F4F4F5] p-1.5 rounded-lg border border-zinc-800 focus:outline-none focus:border-pink-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
          <button
            onClick={onResetToDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restore Defaults</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition shadow"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save & Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
