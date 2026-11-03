import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCompletedDays,
  calculateCompletionRate,
  calculateActiveStreak,
  getPineTreeStage,
  getSleepClassification,
  calculateDailyTotals,
  calculateWeeklyRate,
  calculateMacroDailyCompletion,
  calculateSleepStats,
  calculateMoodFrequencies,
  calculateWeatherFrequencies,
  findLongestStreak,
  calculatePerfectDays,
} from './calculations';
import { DailyHabit, MoodType, WeatherType } from '../types/habit';

test('calculateCompletedDays sums booleans correctly', () => {
  assert.equal(calculateCompletedDays([true, false, true, true, false]), 3);
  assert.equal(calculateCompletedDays([]), 0);
  assert.equal(calculateCompletedDays([false, false]), 0);
  assert.equal(calculateCompletedDays([true, true, true]), 3);
});

test('calculateCompletionRate calculates ratio and clamps', () => {
  assert.equal(calculateCompletionRate(15, 30), 0.5);
  assert.equal(calculateCompletionRate(31, 31), 1.0);
  assert.equal(calculateCompletionRate(0, 31), 0);
  assert.equal(calculateCompletionRate(10, 0), 0);
});

test('calculateActiveStreak counts backward unbroken chain correctly', () => {
  // Empty
  assert.equal(calculateActiveStreak([]), 0);
  // All false
  assert.equal(calculateActiveStreak([false, false, false]), 0);
  // Single true
  assert.equal(calculateActiveStreak([true]), 1);
  // Trailing trues
  assert.equal(calculateActiveStreak([false, true, true, true]), 3);
  // Broken trailing
  assert.equal(calculateActiveStreak([true, true, false]), 2); // last checked day had streak 2
  // Interrupted
  assert.equal(calculateActiveStreak([true, false, true, true]), 2);
  // All 31 days true
  const allTrue = new Array(31).fill(true);
  assert.equal(calculateActiveStreak(allTrue), 31);
});

test('getPineTreeStage follows specification thresholds', () => {
  assert.equal(getPineTreeStage(0), '');
  assert.equal(getPineTreeStage(1), '🌱');
  assert.equal(getPineTreeStage(4), '🌱');
  assert.equal(getPineTreeStage(5), '🌲');
  assert.equal(getPineTreeStage(8), '🌲');
  assert.equal(getPineTreeStage(9), '🌳');
  assert.equal(getPineTreeStage(11), '🌳');
  assert.equal(getPineTreeStage(12), '🌴');
  assert.equal(getPineTreeStage(13), '🌴');
});

test('getSleepClassification maps benchmarks and colors correctly', () => {
  const optimal = getSleepClassification(7.5);
  assert.equal(optimal.category, 'optimal');
  assert.equal(optimal.bgColor, '#133E2B');
  assert.equal(optimal.textColor, '#4ADE80');

  const boundaryOptimal = getSleepClassification(7.0);
  assert.equal(boundaryOptimal.category, 'optimal');

  const caution = getSleepClassification(6.5);
  assert.equal(caution.category, 'caution');
  assert.equal(caution.bgColor, '#3D3214');
  assert.equal(caution.textColor, '#FBBF24');

  const deficit = getSleepClassification(5.5);
  assert.equal(deficit.category, 'deficit');
  assert.equal(deficit.bgColor, '#3E1A1A');
  assert.equal(deficit.textColor, '#F87171');

  const empty = getSleepClassification(null);
  assert.equal(empty.category, 'empty');
});

test('calculateDailyTotals sums routines for each calendar day', () => {
  const habits: DailyHabit[] = [
    { id: '1', name: 'H1', target: 31, checks: [true, false, true] },
    { id: '2', name: 'H2', target: 31, checks: [true, true, false] },
    { id: '3', name: 'H3', target: 31, checks: [false, true, true] },
  ];
  const totals = calculateDailyTotals(habits, 3);
  assert.deepEqual(totals, [2, 2, 2]);
});

test('calculateWeeklyRate evaluates cluster percentage', () => {
  const habits: DailyHabit[] = [
    { id: '1', name: 'H1', target: 31, checks: [true, true, false, false, false, false, false] },
    { id: '2', name: 'H2', target: 31, checks: [false, false, false, false, false, false, false] },
  ];
  // 2 slots checked out of 2 * 7 = 14
  assert.equal(calculateWeeklyRate(habits, 0, 6), 2 / 14);
});

test('calculateMacroDailyCompletion divides total checked by total target', () => {
  const habits: DailyHabit[] = [
    { id: '1', name: 'H1', target: 10, checks: [true, true, false] }, // 2
    { id: '2', name: 'H2', target: 10, checks: [true, true, true] },  // 3
  ];
  assert.equal(calculateMacroDailyCompletion(habits), 5 / 20);
});

test('calculateSleepStats computes average and optimal count', () => {
  const hours = [8, 7.5, 6, 5.5, null, 7];
  const stats = calculateSleepStats(hours);
  // valid: 8, 7.5, 6, 5.5, 7 -> sum 34 / 5 = 6.8
  assert.equal(stats.average, 6.8);
  assert.equal(stats.optimalDays, 3); // 8, 7.5, 7
  assert.equal(stats.populatedDays, 5);
});

test('calculateMoodFrequencies counts categorical moods', () => {
  const moods: MoodType[] = ['😊 Happy', '😊 Happy', '😌 Calm', '🥱 Tired', ''];
  const freqs = calculateMoodFrequencies(moods);
  assert.equal(freqs['😊 Happy'], 2);
  assert.equal(freqs['😌 Calm'], 1);
  assert.equal(freqs['🥱 Tired'], 1);
  assert.equal(freqs['😢 Sad'], 0);
});

test('calculateWeatherFrequencies counts categorical weather', () => {
  const weather: WeatherType[] = ['☀️ Sunny', '☀️ Sunny', '🌧️ Rainy', ''];
  const freqs = calculateWeatherFrequencies(weather);
  assert.equal(freqs['☀️ Sunny'], 2);
  assert.equal(freqs['🌧️ Rainy'], 1);
  assert.equal(freqs['❄️ Snowy'], 0);
});

test('findLongestStreak and calculatePerfectDays', () => {
  const habits: DailyHabit[] = [
    { id: '1', name: 'H1', target: 3, checks: [true, true, false] },
    { id: '2', name: 'H2', target: 3, checks: [true, true, true] },
  ];
  assert.equal(findLongestStreak(habits), 3);
  // Day 0: both true -> perfect
  // Day 1: both true -> perfect
  // Day 2: H1 false -> not perfect
  assert.equal(calculatePerfectDays(habits, 3), 2);
});
