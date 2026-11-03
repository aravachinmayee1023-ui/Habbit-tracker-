import React from 'react';
import { WellnessData, MoodType, WeatherType } from '../types/habit';
import { getSleepClassification, calculateSleepStats } from '../utils/calculations';
import { Moon, Sun, Heart, AlertTriangle, ShieldCheck, BatteryWarning } from 'lucide-react';

interface WellnessLayerProps {
  wellness: WellnessData;
  onUpdateMood: (dayIndex: number, mood: MoodType) => void;
  onUpdateWeather: (dayIndex: number, weather: WeatherType) => void;
  onUpdateSleep: (dayIndex: number, hours: number | null) => void;
}

const MOOD_OPTIONS: MoodType[] = [
  '😊 Happy',
  '🥰 Loved',
  '😌 Calm',
  '😐 Okay',
  '🥱 Tired',
  '😢 Sad',
  '😫 Stressed',
];

const WEATHER_OPTIONS: WeatherType[] = [
  '☀️ Sunny',
  '⛅ P.Cloudy',
  '☁️ Cloudy',
  '🌧️ Rainy',
  '⛈️ Stormy',
  '🌬️ Windy',
  '❄️ Snowy',
];

export const WellnessLayer: React.FC<WellnessLayerProps> = ({
  wellness,
  onUpdateMood,
  onUpdateWeather,
  onUpdateSleep,
}) => {
  const sleepStats = calculateSleepStats(wellness.sleepHours);

  return (
    <div className="w-full bg-[#1E1E24] rounded-2xl border border-zinc-800/80 shadow-lg p-4 lg:p-6 mb-6">
      {/* Header & Sleep Benchmark Reference Guide */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Section 03</span>
            <span className="text-zinc-600">•</span>
            <h2 className="text-base font-bold text-[#F4F4F5]">Wellness & Chronobiological Tracking Layer</h2>
          </div>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Holistic human performance metrics: daily mood states, environmental weather, and benchmarked sleep logs.
          </p>
        </div>

        {/* Sleep Reference Guide Legend Card */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="text-zinc-400 text-xs font-medium mr-1">Sleep Zones:</span>
          {/* Green Focus Zone */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#133E2B] text-[#4ADE80] border border-emerald-800/60">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-semibold">≥ 7.0h Focus Zone</span>
          </div>
          {/* Amber Caution Zone */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#3D3214] text-[#FBBF24] border border-amber-800/60">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="font-semibold">6.0–6.9h Caution</span>
          </div>
          {/* Red Recovery Zone */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#3E1A1A] text-[#F87171] border border-red-900/60">
            <BatteryWarning className="w-3.5 h-3.5" />
            <span className="font-semibold">&lt; 6.0h Deficit</span>
          </div>
        </div>
      </div>

      {/* Wellness Matrix Table */}
      <div className="mt-4 overflow-x-auto border border-zinc-800/90 rounded-xl bg-[#121214]">
        <table className="w-full text-left border-collapse min-w-[1080px]">
          <thead>
            <tr className="bg-[#18181D] text-zinc-400 border-b border-zinc-800 text-[11px] font-mono">
              <th className="px-3 py-1.5 w-[28px] text-zinc-500 font-normal">#</th>
              <th className="px-3 py-1.5 w-[160px] font-medium text-zinc-300">Biometric Layer</th>
              {Array.from({ length: 31 }, (_, i) => (
                <th key={i} className="p-0 text-center w-[24px] border-l border-zinc-800/60 text-zinc-400">
                  {i + 1}
                </th>
              ))}
              <th colSpan={5} className="px-3 text-center text-zinc-400 border-l border-zinc-800">
                Summary Benchmark
              </th>
            </tr>
          </thead>

          <tbody>
            {/* Row 30: Daily Mood Tracker */}
            <tr className="border-b border-zinc-800/50 hover:bg-[#18181E] transition-colors">
              <td className="px-2 py-1 text-center text-[10px] font-mono text-zinc-600">30</td>
              <td className="px-3 py-1 text-xs font-medium text-[#F4F4F5] flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span>Daily Mood</span>
              </td>
              {wellness.moods.map((mood, dayIdx) => {
                const emoji = mood ? mood.split(' ')[0] : '—';
                return (
                  <td key={dayIdx} className="p-0 text-center w-[24px] h-[28px] border-l border-zinc-800/40 relative group">
                    <span className="text-xs pointer-events-none select-none transition-transform group-hover:scale-110 block">
                      {emoji}
                    </span>
                    <select
                      value={mood || ''}
                      onChange={(e) => onUpdateMood(dayIdx, e.target.value as MoodType)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer focus:opacity-100 focus:bg-zinc-800 focus:text-white text-xs"
                      title={`Day ${dayIdx + 1} Mood: ${mood || 'Click to set'}`}
                      aria-label={`Day ${dayIdx + 1} Mood`}
                    >
                      <option value="" className="bg-[#1E1E24] text-zinc-400">— Unset —</option>
                      {MOOD_OPTIONS.map((m) => (
                        <option key={m} value={m} className="bg-[#1E1E24] text-[#F4F4F5]">
                          {m}
                        </option>
                      ))}
                    </select>
                  </td>
                );
              })}
              <td colSpan={5} className="px-3 py-1 text-xs font-mono text-zinc-400 border-l border-zinc-800">
                Formula: =COUNTIF($C$30:$AG$30, "😊 Happy")
              </td>
            </tr>

            {/* Row 31: Daily Weather Tracker */}
            <tr className="border-b border-zinc-800/50 hover:bg-[#18181E] transition-colors">
              <td className="px-2 py-1 text-center text-[10px] font-mono text-zinc-600">31</td>
              <td className="px-3 py-1 text-xs font-medium text-[#F4F4F5] flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Weather Log</span>
              </td>
              {wellness.weather.map((w, dayIdx) => {
                const emoji = w ? w.split(' ')[0] : '—';
                return (
                  <td key={dayIdx} className="p-0 text-center w-[24px] h-[28px] border-l border-zinc-800/40 relative group">
                    <span className="text-xs pointer-events-none select-none transition-transform group-hover:scale-110 block">
                      {emoji}
                    </span>
                    <select
                      value={w || ''}
                      onChange={(e) => onUpdateWeather(dayIdx, e.target.value as WeatherType)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer focus:opacity-100 focus:bg-zinc-800 focus:text-white text-xs"
                      title={`Day ${dayIdx + 1} Weather: ${w || 'Click to set'}`}
                      aria-label={`Day ${dayIdx + 1} Weather`}
                    >
                      <option value="" className="bg-[#1E1E24] text-zinc-400">— Unset —</option>
                      {WEATHER_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-[#1E1E24] text-[#F4F4F5]">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>
                );
              })}
              <td colSpan={5} className="px-3 py-1 text-xs font-mono text-zinc-400 border-l border-zinc-800">
                Formula: =COUNTIF($C$31:$AG$31, "☀️ Sunny")
              </td>
            </tr>

            {/* Row 32: Sleep Duration (Hours) */}
            <tr className="border-b border-zinc-800/50 hover:bg-[#18181E] transition-colors">
              <td className="px-2 py-1 text-center text-[10px] font-mono text-zinc-600">32</td>
              <td className="px-3 py-1 text-xs font-medium text-[#F4F4F5] flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Sleep Hours</span>
              </td>
              {wellness.sleepHours.map((hours, dayIdx) => {
                const classification = getSleepClassification(hours);
                return (
                  <td
                    key={dayIdx}
                    className="p-0 text-center w-[24px] h-[28px] border-l border-zinc-800/40 relative transition-colors"
                    style={{
                      backgroundColor: classification.bgColor,
                    }}
                  >
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="24"
                      value={hours !== null && hours !== undefined ? hours : ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : parseFloat(e.target.value);
                        onUpdateSleep(dayIdx, val);
                      }}
                      className="w-full h-full bg-transparent text-center text-[11px] font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      style={{ color: classification.textColor }}
                      title={`Day ${dayIdx + 1}: ${hours ?? 'Unlogged'}h (${classification.label})`}
                      aria-label={`Day ${dayIdx + 1} Sleep Duration`}
                    />
                  </td>
                );
              })}

              {/* Summary columns */}
              <td className="px-2 py-1 text-center text-xs font-mono text-zinc-400 border-l border-zinc-800">
                Avg
              </td>
              <td className="px-2 py-1 text-center text-xs font-mono font-bold text-emerald-400">
                {sleepStats.average}h
              </td>
              <td className="px-2 py-1 text-center text-xs font-mono font-bold text-[#F4F4F5]">
                {sleepStats.optimalDays}d
              </td>
              <td colSpan={2} className="px-3 py-1 text-right text-xs font-mono text-emerald-400">
                {Math.round((sleepStats.optimalDays / (sleepStats.populatedDays || 1)) * 100)}% in Focus Zone
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
