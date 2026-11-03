import React, { useMemo } from 'react';
import { DailyHabit } from '../types/habit';
import { WEEK_PALETTES, getWeekForDay } from '../data/defaultData';
import {
  calculateCompletedDays,
  calculateCompletionRate,
  calculateActiveStreak,
  getPineTreeStage,
  calculateDailyTotals,
} from '../utils/calculations';
import { Check, Flame, Trophy, TrendingUp } from 'lucide-react';

interface DailyExecutionMatrixProps {
  habits: DailyHabit[];
  onToggleHabitCheck: (habitIndex: number, dayIndex: number) => void;
}

export const DailyExecutionMatrix: React.FC<DailyExecutionMatrixProps> = ({
  habits,
  onToggleHabitCheck,
}) => {
  // Compute daily totals across all 13 habits for Days 1..31
  const dailyTotals = useMemo(() => calculateDailyTotals(habits, 31), [habits]);

  // Compute top ranked habits
  const rankedHabits = useMemo(() => {
    return [...habits]
      .map((h, originalIndex) => {
        const completed = calculateCompletedDays(h.checks);
        const rate = calculateCompletionRate(completed, h.target);
        const streak = calculateActiveStreak(h.checks);
        return { habit: h, originalIndex, completed, rate, streak };
      })
      .sort((a, b) => b.rate - a.rate || b.streak - a.streak);
  }, [habits]);

  // Today's bloom: current latest day completion
  const currentDayIndex = 30; // Day 31 in January
  const todayCompletedCount = dailyTotals[currentDayIndex];
  const todayBloomIcon = getPineTreeStage(todayCompletedCount) || '🌱';

  return (
    <div className="w-full bg-[#1E1E24] rounded-2xl border border-zinc-800/80 shadow-lg p-4 lg:p-6 mb-6">
      {/* Matrix Header Zone: Title & Top Habits Performance Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-400">Section 02</span>
            <span className="text-zinc-600">•</span>
            <h2 className="text-base font-bold text-[#F4F4F5]">Daily Habit Execution Matrix & Growth Visualizer</h2>
          </div>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            13 operational routines mapped across 31 calendar columns with 5 weekly pastel blocks, streak engine, and sparklines.
          </p>
        </div>

        {/* Top Habits consistency preview */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121214] border border-zinc-800 text-xs">
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-zinc-400 text-[11px] font-medium">Top Consistency:</span>
            {rankedHabits.slice(0, 3).map((item, idx) => (
              <span
                key={item.habit.id}
                className="px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-800/80 text-zinc-200 border border-zinc-700/60 flex items-center gap-1"
              >
                <span className="text-amber-400 text-[9px]">#{idx + 1}</span>
                <span className="truncate max-w-[100px]">{item.habit.name}</span>
                <span className="text-pink-400 font-mono text-[10px]">{Math.round(item.rate * 100)}%</span>
              </span>
            ))}
          </div>

          {/* Today's Bloom module */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#18181D] border border-emerald-900/60">
            <span className="text-lg animate-bounce">{todayBloomIcon}</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-400 font-medium">Today's Bloom</span>
              <span className="text-[11px] font-bold text-emerald-300 font-mono">{todayCompletedCount}/13 Done</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Execution Bar Chart (Mapped to Days 1..31) */}
      <div className="mt-4 pt-2 pb-1">
        <div className="flex items-center justify-between mb-1.5 px-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-pink-400" />
            Daily Completed Routines (Column Chart: 0 to 13 Target)
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">Max: 13 routines / day</span>
        </div>
        <div className="bg-[#121214] p-3 rounded-xl border border-zinc-800/70 overflow-x-auto">
          <div className="min-w-[860px] flex items-end gap-1 h-20 pt-2 px-1">
            {/* Legend column label */}
            <div className="w-[160px] h-full flex flex-col justify-between text-[10px] text-zinc-500 font-mono pr-2 border-r border-zinc-800/80">
              <span className="text-right">13 (100%)</span>
              <span className="text-right">6 (~50%)</span>
              <span className="text-right">0 (0%)</span>
            </div>

            {/* 31 Day Bars */}
            {dailyTotals.map((count, dayIndex) => {
              const weekInfo = getWeekForDay(dayIndex);
              const barHeightPct = Math.max(6, Math.min(100, (count / 13) * 100));

              return (
                <div
                  key={dayIndex}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative"
                  style={{ minWidth: '22px' }}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-[9px] font-mono px-1.5 py-0.5 rounded border border-zinc-700 pointer-events-none whitespace-nowrap z-20 shadow-lg">
                    Day {dayIndex + 1}: {count}/13 done
                  </div>

                  <span className="text-[9px] font-mono text-zinc-400 group-hover:text-white mb-0.5 font-bold">
                    {count}
                  </span>
                  <div
                    className="w-full rounded-t transition-all duration-300"
                    style={{
                      height: `${barHeightPct}%`,
                      backgroundColor: weekInfo.accentColor,
                      opacity: count > 0 ? 0.9 : 0.2,
                    }}
                  />
                </div>
              );
            })}

            {/* Empty space matching the summary columns */}
            <div className="w-[280px] pl-3 border-l border-zinc-800/60 flex items-center justify-center text-[10px] text-zinc-500">
              Monthly Cumulative Trend
            </div>
          </div>
        </div>
      </div>

      {/* Spreadsheet Matrix Grid Table */}
      <div className="mt-4 overflow-x-auto border border-zinc-800/90 rounded-xl bg-[#121214]">
        <table className="w-full text-left border-collapse min-w-[1080px]">
          <thead>
            {/* Week Clusters Super-Header */}
            <tr className="bg-[#18181D] text-[10px] font-semibold border-b border-zinc-800/80">
              <th className="px-3 py-1.5 w-[28px] text-zinc-500 font-mono">#</th>
              <th className="px-3 py-1.5 w-[160px] text-zinc-400 font-medium">Weekly Blocks</th>
              {WEEK_PALETTES.map((wp) => {
                const daysCount = wp.endDay - wp.startDay + 1;
                return (
                  <th
                    key={wp.week}
                    colSpan={daysCount}
                    className="py-1 text-center border-l border-r font-mono tracking-wider"
                    style={{
                      borderColor: wp.lightBorder,
                      backgroundColor: wp.darkFill,
                      color: wp.accentColor,
                    }}
                  >
                    {wp.name} ({wp.daysRange})
                  </th>
                );
              })}
              <th colSpan={5} className="py-1 px-3 text-center text-zinc-400 border-l border-zinc-800 font-medium">
                Statistical Summary Engine
              </th>
            </tr>

            {/* Pine Tree Visualizer Row */}
            <tr className="bg-[#141418] border-b border-zinc-800/70 text-xs font-mono">
              <td className="px-3 py-1 text-zinc-600 text-center font-bold">🌱</td>
              <td className="px-3 py-1 text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                <span>Pine Tree Visualizer</span>
              </td>
              {dailyTotals.map((count, dayIdx) => {
                const treeIcon = getPineTreeStage(count);
                return (
                  <td
                    key={dayIdx}
                    className="p-0 text-center w-[24px] h-[24px] border-l border-zinc-800/50 text-xs"
                    title={`Day ${dayIdx + 1}: ${count} routines completed (${treeIcon || 'No routines'})`}
                  >
                    <span className="inline-block transition-transform duration-300 hover:scale-125">
                      {treeIcon}
                    </span>
                  </td>
                );
              })}
              {/* Summary header labels */}
              <td className="px-2 py-1 text-center w-[42px] text-[10px] text-zinc-400 font-mono">Goal</td>
              <td className="px-2 py-1 text-center w-[42px] text-[10px] text-zinc-400 font-mono">Done</td>
              <td className="px-2 py-1 text-center w-[48px] text-[10px] text-zinc-400 font-mono">%</td>
              <td className="px-2 py-1 text-center w-[45px] text-[10px] text-zinc-400 font-mono">Strk</td>
              <td className="px-2 py-1 text-center w-[90px] text-[10px] text-zinc-400 font-mono">Sparkline</td>
            </tr>

            {/* Day Numbers & Calendar Headers */}
            <tr className="bg-[#1A1A20] text-zinc-400 border-b border-zinc-800 text-[11px] font-mono">
              <th className="px-2 py-1 text-center text-zinc-500 font-normal">Id</th>
              <th className="px-3 py-1 text-left font-medium text-zinc-300">Habit Routine (13 Daily)</th>
              {Array.from({ length: 31 }, (_, i) => {
                const weekInfo = getWeekForDay(i);
                return (
                  <th
                    key={i}
                    className="p-0 text-center w-[24px] border-l font-bold"
                    style={{
                      borderColor: '#27272A',
                      color: weekInfo.accentColor,
                    }}
                  >
                    {i + 1}
                  </th>
                );
              })}
              <th className="px-1 text-center text-[10px] text-zinc-400 border-l border-zinc-800">AH</th>
              <th className="px-1 text-center text-[10px] text-zinc-400">AI</th>
              <th className="px-1 text-center text-[10px] text-zinc-400">AJ</th>
              <th className="px-1 text-center text-[10px] text-zinc-400">AK</th>
              <th className="px-2 text-center text-[10px] text-zinc-400">AL (Bar)</th>
            </tr>
          </thead>

          <tbody>
            {habits.map((habit, habitIdx) => {
              const completedDays = calculateCompletedDays(habit.checks);
              const completionRate = calculateCompletionRate(completedDays, habit.target);
              const streak = calculateActiveStreak(habit.checks);
              const pctFormatted = Math.round(completionRate * 100);

              return (
                <tr
                  key={habit.id}
                  className="border-b border-zinc-800/50 hover:bg-[#18181E] transition-colors group"
                >
                  {/* Row Index */}
                  <td className="px-2 py-1 text-center text-[10px] font-mono text-zinc-600">
                    {habitIdx + 1 < 10 ? `0${habitIdx + 1}` : habitIdx + 1}
                  </td>

                  {/* Habit Name */}
                  <td className="px-3 py-1 text-xs font-medium text-[#F4F4F5] truncate max-w-[160px] flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-3.5 rounded-sm shrink-0"
                      style={{ backgroundColor: habit.color || '#F472B6' }}
                    />
                    <span title={habit.name}>{habit.name}</span>
                  </td>

                  {/* 31 Day Checkbox Columns */}
                  {habit.checks.map((isChecked, dayIdx) => {
                    const weekInfo = getWeekForDay(dayIdx);
                    return (
                      <td
                        key={dayIdx}
                        className="p-0 text-center w-[24px] h-[24px] border-l border-zinc-800/40 relative"
                        style={{
                          backgroundColor: isChecked ? weekInfo.darkFill : 'transparent',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => onToggleHabitCheck(habitIdx, dayIdx)}
                          className="w-full h-full flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-pink-500/50 cursor-pointer"
                          aria-label={`Toggle ${habit.name} for Day ${dayIdx + 1}`}
                        >
                          {isChecked ? (
                            <span
                              className="w-3.5 h-3.5 rounded flex items-center justify-center transition-transform scale-100"
                              style={{
                                backgroundColor: weekInfo.accentColor,
                                color: '#121214',
                              }}
                            >
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="w-3.5 h-3.5 rounded border border-zinc-700/60 group-hover:border-zinc-500/80 transition-colors" />
                          )}
                        </button>
                      </td>
                    );
                  })}

                  {/* Column AH: Target Goal */}
                  <td className="px-1 py-1 text-center text-xs font-mono text-zinc-400 border-l border-zinc-800">
                    {habit.target}
                  </td>

                  {/* Column AI: Completed Days */}
                  <td className="px-1 py-1 text-center text-xs font-mono font-bold text-[#F4F4F5]">
                    {completedDays}
                  </td>

                  {/* Column AJ: Completion % */}
                  <td className="px-1 py-1 text-center text-xs font-mono font-bold" style={{ color: habit.color || '#F472B6' }}>
                    {pctFormatted}%
                  </td>

                  {/* Column AK: Active Streak */}
                  <td className="px-1 py-1 text-center text-xs font-mono text-zinc-300">
                    <span className="inline-flex items-center gap-0.5">
                      {streak > 0 && <Flame className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />}
                      {streak}
                    </span>
                  </td>

                  {/* Column AL: In-Cell Sparkline Progress Bar */}
                  <td className="px-2 py-1 text-center">
                    <div className="w-[80px] h-3 bg-zinc-800/80 rounded-full overflow-hidden p-0.5 border border-zinc-700/50">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pctFormatted}%`,
                          backgroundColor: habit.color || '#F472B6',
                        }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Row 28: Daily Task Count Summary */}
            <tr className="bg-[#18181D] border-t-2 border-zinc-700 font-mono text-xs">
              <td className="px-2 py-1.5 text-center text-zinc-500 font-bold">∑</td>
              <td className="px-3 py-1.5 font-bold text-zinc-200">Daily Task Count</td>
              {dailyTotals.map((count, dayIdx) => (
                <td
                  key={dayIdx}
                  className="p-0 text-center w-[24px] border-l border-zinc-800 font-bold text-zinc-200"
                >
                  {count}
                </td>
              ))}
              <td className="px-1 text-center text-zinc-400 border-l border-zinc-800">403</td>
              <td className="px-1 text-center font-bold text-pink-400">
                {dailyTotals.reduce((a, b) => a + b, 0)}
              </td>
              <td className="px-1 text-center font-bold text-emerald-400">
                {Math.round((dailyTotals.reduce((a, b) => a + b, 0) / 403) * 100)}%
              </td>
              <td colSpan={2} className="px-2 text-right text-[10px] text-zinc-500">
                403 Total Positions
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
