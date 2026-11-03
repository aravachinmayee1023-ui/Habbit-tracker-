import React from 'react';
import { WeeklyBlock, MonthlyGoalItem, WeeklyTaskItem } from '../types/habit';
import { Check, CheckSquare, Layers, Plus, CalendarCheck, Clock, Shield } from 'lucide-react';

interface MultiHorizonTasksProps {
  weeklyBlocks: WeeklyBlock[];
  monthlyGoals: MonthlyGoalItem[];
  extraTasks: WeeklyTaskItem[];
  onToggleWeeklyTask: (weekNumber: number, taskId: string) => void;
  onToggleMonthlyGoal: (goalId: string) => void;
  onToggleExtraTask: (taskId: string) => void;
}

export const MultiHorizonTasks: React.FC<MultiHorizonTasksProps> = ({
  weeklyBlocks,
  monthlyGoals,
  extraTasks,
  onToggleWeeklyTask,
  onToggleMonthlyGoal,
  onToggleExtraTask,
}) => {
  return (
    <div className="w-full bg-[#1E1E24] rounded-2xl border border-zinc-800/80 shadow-lg p-4 lg:p-6 mb-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Section 05</span>
            <span className="text-zinc-600">•</span>
            <h2 className="text-base font-bold text-[#F4F4F5]">Multi-Horizon Task Management Tier</h2>
          </div>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            5 weekly milestone cards, 14-point monthly life maintenance checklist, and ad-hoc administrative projects.
          </p>
        </div>
      </div>

      {/* Part 1: 5 Weekly Habit Cards */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-pink-400" />
            Weekly Milestone Cards (Weeks 1 through 5)
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">Card-specific % completion rate</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {weeklyBlocks.map((block) => {
            const completedCount = block.tasks.filter((t) => t.completed).length;
            const totalCount = block.tasks.length;
            const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            return (
              <div
                key={block.weekNumber}
                className="bg-[#121214] rounded-xl border p-3.5 flex flex-col justify-between transition-all hover:border-zinc-700"
                style={{ borderColor: `${block.accentColor}30` }}
              >
                {/* Card Top */}
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60 mb-2.5">
                    <div>
                      <span className="text-xs font-bold" style={{ color: block.accentColor }}>
                        Week {block.weekNumber}
                      </span>
                      <span className="text-[10px] text-zinc-500 ml-1.5">({block.daysRange})</span>
                    </div>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono"
                      style={{
                        backgroundColor: block.darkFill,
                        color: block.accentColor,
                      }}
                    >
                      {pct}%
                    </span>
                  </div>

                  {/* Tasks List */}
                  <div className="flex flex-col gap-2">
                    {block.tasks.map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => onToggleWeeklyTask(block.weekNumber, task.id)}
                        className="flex items-start gap-2 text-left group cursor-pointer"
                        aria-label={`Toggle weekly task: ${task.title}`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded mt-0.5 shrink-0 flex items-center justify-center transition-colors ${
                            task.completed
                              ? 'text-zinc-950 font-bold'
                              : 'border border-zinc-700 group-hover:border-zinc-500'
                          }`}
                          style={{
                            backgroundColor: task.completed ? block.accentColor : 'transparent',
                          }}
                        >
                          {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </span>
                        <span
                          className={`text-xs leading-snug transition-colors ${
                            task.completed
                              ? 'line-through text-zinc-500'
                              : 'text-zinc-300 group-hover:text-white'
                          }`}
                        >
                          {task.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Bottom Progress Bar */}
                <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-500">
                  <span>{completedCount}/{totalCount} Completed</span>
                  <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: block.accentColor,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Part 2: Monthly Goals Matrix (14 items) & Ad-hoc Administrative Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 pt-5 border-t border-zinc-800/60">
        {/* Monthly Checklist (8 cols) */}
        <div className="lg:col-span-8 bg-[#121214] p-4 rounded-xl border border-zinc-800/80">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800/60">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5 text-sky-400" />
              Monthly Life Maintenance Checklist (14 Goals)
            </span>
            <span className="text-xs font-mono font-bold text-sky-400">
              {monthlyGoals.filter((g) => g.completed).length} / {monthlyGoals.length} Achieved
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {monthlyGoals.map((goal) => (
              <button
                key={goal.id}
                type="button"
                onClick={() => onToggleMonthlyGoal(goal.id)}
                className="flex items-start gap-2.5 p-2 rounded-lg bg-[#18181D] hover:bg-[#202028] border border-zinc-800/70 text-left transition group cursor-pointer"
                aria-label={`Toggle monthly goal: ${goal.title}`}
              >
                <span
                  className={`w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center transition-colors ${
                    goal.completed
                      ? 'bg-sky-400 text-zinc-950 font-bold'
                      : 'border border-zinc-700 group-hover:border-zinc-500'
                  }`}
                >
                  {goal.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </span>
                <div className="flex flex-col">
                  <span
                    className={`text-xs font-medium leading-tight ${
                      goal.completed ? 'line-through text-zinc-500' : 'text-zinc-200 group-hover:text-white'
                    }`}
                  >
                    {goal.title}
                  </span>
                  <span className="text-[10px] text-zinc-500 mt-0.5">Category: {goal.category}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Ad-hoc Administrative Tasks (4 cols) */}
        <div className="lg:col-span-4 bg-[#121214] p-4 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800/60">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Ad-hoc Administrative Tasks
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {extraTasks.filter((t) => t.completed).length}/{extraTasks.length} Done
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {extraTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => onToggleExtraTask(task.id)}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-[#18181D] hover:bg-[#202028] border border-zinc-800/70 text-left transition group cursor-pointer"
                  aria-label={`Toggle extra task: ${task.title}`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded shrink-0 flex items-center justify-center transition-colors ${
                      task.completed
                        ? 'bg-amber-400 text-zinc-950 font-bold'
                        : 'border border-zinc-700 group-hover:border-zinc-500'
                    }`}
                  >
                    {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </span>
                  <span
                    className={`text-xs ${
                      task.completed ? 'line-through text-zinc-500' : 'text-zinc-200 group-hover:text-white'
                    }`}
                  >
                    {task.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/60 text-[10px] text-zinc-500">
            Tasks sync automatically across operational cards and export directly to Google Sheets.
          </div>
        </div>
      </div>
    </div>
  );
};
