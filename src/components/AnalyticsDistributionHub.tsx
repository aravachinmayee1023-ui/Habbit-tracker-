import React, { useMemo } from 'react';
import { WellnessData, ReflectionData } from '../types/habit';
import { calculateMoodFrequencies, calculateWeatherFrequencies } from '../utils/calculations';
import { PieChart, BookOpen, Lightbulb, Sparkles, Sun, Heart } from 'lucide-react';

interface AnalyticsDistributionHubProps {
  wellness: WellnessData;
  reflection: ReflectionData;
  onUpdateReflection: (field: keyof ReflectionData, value: string) => void;
}

const MOOD_COLOR_MAP: Record<string, string> = {
  '😊 Happy': '#FACC15', // Soft Gold
  '🥰 Loved': '#F472B6', // Rose Pink
  '😌 Calm': '#38BDF8', // Cyan Blue
  '😐 Okay': '#A1A1AA', // Slate Grey
  '🥱 Tired': '#FB923C', // Warm Orange
  '😢 Sad': '#818CF8', // Indigo
  '😫 Stressed': '#F87171', // Coral Red
};

const WEATHER_COLOR_MAP: Record<string, string> = {
  '☀️ Sunny': '#FACC15',
  '⛅ P.Cloudy': '#38BDF8',
  '☁️ Cloudy': '#94A3B8',
  '🌧️ Rainy': '#60A5FA',
  '⛈️ Stormy': '#A78BFA',
  '🌬️ Windy': '#2DD4BF',
  '❄️ Snowy': '#E0E7FF',
};

export const AnalyticsDistributionHub: React.FC<AnalyticsDistributionHubProps> = ({
  wellness,
  reflection,
  onUpdateReflection,
}) => {
  const moodFreqs = useMemo(() => calculateMoodFrequencies(wellness.moods), [wellness.moods]);
  const weatherFreqs = useMemo(() => calculateWeatherFrequencies(wellness.weather), [wellness.weather]);

  const totalMoodsLogged = useMemo(
    () => Object.values(moodFreqs).reduce((a, b) => a + b, 0),
    [moodFreqs]
  );
  const totalWeatherLogged = useMemo(
    () => Object.values(weatherFreqs).reduce((a, b) => a + b, 0),
    [weatherFreqs]
  );

  // SVG Donut generator with 75% hole size
  const renderDonutChart = (
    data: Record<string, number>,
    colorMap: Record<string, string>,
    total: number,
    centerTitle: string,
    centerValue: string
  ) => {
    const size = 160;
    const center = size / 2;
    const strokeWidth = 20; // 75% hole size
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;

    let cumulativeAngle = -90; // Start at top
    const slices: { label: string; count: number; pct: number; color: string; dashOffset: number; dashArray: string }[] = [];

    if (total === 0) {
      return (
        <div className="w-40 h-40 flex items-center justify-center text-xs text-zinc-500 font-mono">
          No data logged
        </div>
      );
    }

    Object.entries(data).forEach(([label, count]) => {
      if (count > 0) {
        const pct = count / total;
        const sliceLength = pct * circumference;
        slices.push({
          label,
          count,
          pct,
          color: colorMap[label] || '#A1A1AA',
          dashOffset: 0,
          dashArray: `${sliceLength} ${circumference - sliceLength}`,
        });
      }
    });

    let currentRotation = -90;

    return (
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* SVG Donut */}
        <div className="relative w-40 h-40 shrink-0">
          <svg className="w-40 h-40" viewBox={`0 0 ${size} ${size}`}>
            {/* Background ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#27272A"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Slices */}
            {slices.map((slice, idx) => {
              const rotation = currentRotation;
              currentRotation += slice.pct * 360;
              return (
                <circle
                  key={idx}
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={slice.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={slice.dashArray}
                  strokeLinecap="butt"
                  fill="transparent"
                  transform={`rotate(${rotation} ${center} ${center})`}
                  className="transition-all duration-500 ease-out hover:opacity-80"
                />
              );
            })}
          </svg>

          {/* Donut Center Hole Text (75% hole) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">{centerTitle}</span>
            <span className="text-sm font-bold text-[#F4F4F5] font-mono">{centerValue}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-1.5 w-full max-w-[200px]">
          {Object.entries(data).map(([label, count]) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={label} className="flex items-center justify-between text-xs text-[#A1A1AA]">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: colorMap[label] || '#71717A' }}
                  />
                  <span className="truncate">{label}</span>
                </div>
                <span className="font-mono text-zinc-300 font-semibold">{count} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-[#1E1E24] rounded-2xl border border-zinc-800/80 shadow-lg p-4 lg:p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Section 04</span>
            <span className="text-zinc-600">•</span>
            <h2 className="text-base font-bold text-[#F4F4F5]">Analytical Distribution Hub & Reflection Synthesizer</h2>
          </div>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Quantitative behavioral insights paired with qualitative causal reflections between environment, habits, and energy.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column (5 Cols): Twin Donut Ring Visualizers */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Donut 1: Mood Distribution */}
          <div className="bg-[#121214] p-4 rounded-xl border border-zinc-800/80">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800/60">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-pink-400" />
                Mood Distribution (75% Ring)
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">{totalMoodsLogged}/31 Days</span>
            </div>
            {renderDonutChart(
              moodFreqs,
              MOOD_COLOR_MAP,
              totalMoodsLogged,
              'Mood Ring',
              `${moodFreqs['😊 Happy'] || 0} Happy`
            )}
          </div>

          {/* Donut 2: Weather Distribution */}
          <div className="bg-[#121214] p-4 rounded-xl border border-zinc-800/80">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800/60">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Weather Distribution (75% Ring)
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">{totalWeatherLogged}/31 Days</span>
            </div>
            {renderDonutChart(
              weatherFreqs,
              WEATHER_COLOR_MAP,
              totalWeatherLogged,
              'Climate',
              `${weatherFreqs['☀️ Sunny'] || 0} Sunny`
            )}
          </div>
        </div>

        {/* Right Column (7 Cols): Qualitative Mood Reflection Synthesizer */}
        <div className="lg:col-span-7 bg-[#121214] p-5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-[#F4F4F5]">Qualitative Reflection Synthesizer</h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">Continuous Learning Engine</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Field 1: Nutritional & Timing */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                <span>☕</span>
                <span>Nutritional & Timing Influences</span>
              </label>
              <textarea
                value={reflection.nutritionalTiming}
                onChange={(e) => onUpdateReflection('nutritionalTiming', e.target.value)}
                rows={3}
                placeholder="Log diet and coffee timing correlations..."
                className="w-full bg-[#18181D] text-xs text-[#F4F4F5] p-2.5 rounded-lg border border-zinc-800 focus:outline-none focus:border-amber-500/60 transition resize-none"
              />
            </div>

            {/* Field 2: Environmental */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-sky-300 flex items-center gap-1">
                <span>☀️</span>
                <span>Environmental & Weather Influences</span>
              </label>
              <textarea
                value={reflection.environmental}
                onChange={(e) => onUpdateReflection('environmental', e.target.value)}
                rows={3}
                placeholder="How did sunny vs rainy days impact mood?..."
                className="w-full bg-[#18181D] text-xs text-[#F4F4F5] p-2.5 rounded-lg border border-zinc-800 focus:outline-none focus:border-sky-500/60 transition resize-none"
              />
            </div>

            {/* Field 3: Sleep & Recovery */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
                <span>🌙</span>
                <span>Sleep & Recovery Predictors</span>
              </label>
              <textarea
                value={reflection.sleepRecovery}
                onChange={(e) => onUpdateReflection('sleepRecovery', e.target.value)}
                rows={3}
                placeholder="Screen time impact on deep sleep..."
                className="w-full bg-[#18181D] text-xs text-[#F4F4F5] p-2.5 rounded-lg border border-zinc-800 focus:outline-none focus:border-emerald-500/60 transition resize-none"
              />
            </div>

            {/* Field 4: Actionable Adjustments */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-pink-300 flex items-center gap-1">
                <span>🎯</span>
                <span>Actionable Adjustments for Next Month</span>
              </label>
              <textarea
                value={reflection.actionableAdjustments}
                onChange={(e) => onUpdateReflection('actionableAdjustments', e.target.value)}
                rows={3}
                placeholder="Target adjustments for next cycle..."
                className="w-full bg-[#18181D] text-xs text-[#F4F4F5] p-2.5 rounded-lg border border-zinc-800 focus:outline-none focus:border-pink-500/60 transition resize-none"
              />
            </div>
          </div>

          {/* Bottom Reflection Banner: Wins & Learnings */}
          <div className="mt-4 pt-4 border-t border-zinc-800/60 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#18181D] p-3 rounded-lg border border-zinc-800">
              <div className="text-[10px] font-semibold uppercase text-emerald-400 mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Monthly Habit Wins</span>
              </div>
              <input
                type="text"
                value={reflection.monthlyWins}
                onChange={(e) => onUpdateReflection('monthlyWins', e.target.value)}
                className="w-full bg-transparent text-xs text-zinc-300 focus:outline-none"
                placeholder="What went exceptionally well?"
              />
            </div>

            <div className="bg-[#18181D] p-3 rounded-lg border border-zinc-800">
              <div className="text-[10px] font-semibold uppercase text-purple-400 mb-1 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                <span>Core Monthly Learnings</span>
              </div>
              <input
                type="text"
                value={reflection.monthlyLearnings}
                onChange={(e) => onUpdateReflection('monthlyLearnings', e.target.value)}
                className="w-full bg-transparent text-xs text-zinc-300 focus:outline-none"
                placeholder="Key mindset takeaway..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
