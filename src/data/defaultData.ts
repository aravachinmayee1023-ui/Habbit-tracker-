import { HabitTrackerState, MoodType, WeatherType } from '../types/habit';

export const WEEK_PALETTES = [
  {
    week: 1,
    name: 'Week 1',
    daysRange: 'Days 1–7',
    startDay: 0,
    endDay: 6,
    accentColor: '#F472B6', // Rose Pink
    darkFill: '#3B2030', // Dark Rose
    lightBorder: '#F472B640',
  },
  {
    week: 2,
    name: 'Week 2',
    daysRange: 'Days 8–14',
    startDay: 7,
    endDay: 13,
    accentColor: '#FB923C', // Warm Orange
    darkFill: '#3A281C', // Dark Amber
    lightBorder: '#FB923C40',
  },
  {
    week: 3,
    name: 'Week 3',
    daysRange: 'Days 15–21',
    startDay: 14,
    endDay: 20,
    accentColor: '#FACC15', // Soft Gold
    darkFill: '#38321A', // Dark Gold
    lightBorder: '#FACC1540',
  },
  {
    week: 4,
    name: 'Week 4',
    daysRange: 'Days 22–28',
    startDay: 21,
    endDay: 27,
    accentColor: '#38BDF8', // Cyan Blue
    darkFill: '#1A2F3D', // Dark Blue
    lightBorder: '#38BDF840',
  },
  {
    week: 5,
    name: 'Week 5',
    daysRange: 'Days 29–31',
    startDay: 28,
    endDay: 30,
    accentColor: '#C084FC', // Soft Purple
    darkFill: '#2D1F3F', // Dark Violet
    lightBorder: '#C084FC40',
  },
];

// Helper to get week info for a day (0-indexed: 0..30)
export function getWeekForDay(dayIndex: number) {
  if (dayIndex <= 6) return WEEK_PALETTES[0];
  if (dayIndex <= 13) return WEEK_PALETTES[1];
  if (dayIndex <= 20) return WEEK_PALETTES[2];
  if (dayIndex <= 27) return WEEK_PALETTES[3];
  return WEEK_PALETTES[4];
}

const defaultChecks: boolean[][] = [
  // 1. Sleep 7+ hours (23/31)
  [true, true, true, true, false, true, true, true, true, true, false, true, true, true, true, true, false, true, true, true, true, true, true, false, true, true, true, true, true, false, true],
  // 2. Drink 2L of water (26/31)
  [true, true, true, true, true, true, false, true, true, true, true, true, false, true, true, true, true, true, true, true, false, true, true, true, true, true, true, true, true, true, true],
  // 3. Morning sunlight (24/31)
  [true, true, false, true, true, true, true, true, true, false, true, true, true, true, false, true, true, true, true, true, true, false, true, true, true, true, true, true, true, false, true],
  // 4. No added sugar (19/31)
  [true, true, true, false, false, true, true, true, false, true, true, false, true, true, false, true, true, true, false, true, true, false, true, true, true, false, true, true, false, true, true],
  // 5. Read 20 pages (25/31)
  [true, true, true, true, true, false, true, true, true, true, true, false, true, true, true, true, true, true, false, true, true, true, true, true, true, true, false, true, true, true, true],
  // 6. Move for 30 mins (23/31)
  [true, false, true, true, true, true, false, true, true, true, true, true, false, true, true, true, false, true, true, true, true, true, false, true, true, true, true, false, true, true, true],
  // 7. Eat my greens (25/31)
  [true, true, true, true, false, true, true, true, true, true, true, false, true, true, true, true, true, true, true, false, true, true, true, true, true, false, true, true, true, true, true],
  // 8. Meditate 10 mins (21/31)
  [true, true, false, true, true, false, true, true, false, true, true, true, false, true, true, false, true, true, true, true, false, true, true, false, true, true, true, true, false, true, true],
  // 9. Phone off by 10pm (18/31)
  [false, true, true, false, true, true, false, true, true, false, true, false, true, true, false, true, true, false, true, true, false, true, false, true, true, false, true, true, false, true, true],
  // 10. Journal (22/31)
  [true, true, true, false, true, true, false, true, true, true, false, true, true, false, true, true, true, true, false, true, true, true, false, true, true, true, false, true, true, true, true],
  // 11. 20min night walk at park (19/31)
  [true, false, true, true, false, true, true, false, true, true, false, true, true, false, true, true, false, true, true, false, true, true, false, true, true, false, true, true, true, false, true],
  // 12. Time with family (27/31)
  [true, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true, true, true, true, true],
  // 13. No coffee till 12pm (21/31)
  [true, true, false, true, true, true, false, true, true, true, false, true, true, true, false, true, true, true, false, true, true, true, false, true, true, true, false, true, true, true, true],
];

const defaultMoods: MoodType[] = [
  '😊 Happy', '😊 Happy', '😌 Calm', '😊 Happy', '🥰 Loved', '😌 Calm', '😊 Happy',
  '😊 Happy', '🥱 Tired', '😌 Calm', '😊 Happy', '🥰 Loved', '😌 Calm', '😊 Happy',
  '😊 Happy', '😌 Calm', '😐 Okay', '🥰 Loved', '😊 Happy', '😌 Calm', '😊 Happy',
  '🥰 Loved', '🥱 Tired', '😌 Calm', '😊 Happy', '😌 Calm', '🥰 Loved', '😊 Happy',
  '😌 Calm', '😊 Happy', '🥰 Loved'
];

const defaultWeather: WeatherType[] = [
  '☀️ Sunny', '☀️ Sunny', '⛅ P.Cloudy', '☀️ Sunny', '☀️ Sunny', '⛅ P.Cloudy', '☀️ Sunny',
  '🌧️ Rainy', '🌧️ Rainy', '⛅ P.Cloudy', '☀️ Sunny', '☀️ Sunny', '⛅ P.Cloudy', '☀️ Sunny',
  '☀️ Sunny', '⛅ P.Cloudy', '☁️ Cloudy', '🌧️ Rainy', '☀️ Sunny', '☀️ Sunny', '⛅ P.Cloudy',
  '☀️ Sunny', '⛅ P.Cloudy', '☀️ Sunny', '☀️ Sunny', '⛅ P.Cloudy', '🌧️ Rainy', '☀️ Sunny',
  '☀️ Sunny', '⛅ P.Cloudy', '☀️ Sunny'
];

const defaultSleepHours: (number | null)[] = [
  7.5, 7.8, 7.2, 8.0, 5.8, 7.4, 7.6,
  7.2, 6.2, 7.5, 7.8, 8.1, 6.8, 7.5,
  7.6, 7.3, 5.9, 7.8, 7.4, 7.5, 7.9,
  8.0, 6.4, 7.5, 7.7, 7.2, 6.5, 7.8,
  7.6, 6.8, 8.2
];

export const INITIAL_HABIT_TRACKER_STATE: HabitTrackerState = {
  monthName: 'January',
  monthNumber: '01',
  year: 2027,
  userName: 'Ava',
  greetingSubtext: 'Small steps, every day.',
  habits: [
    { id: 'h1', name: 'Sleep 7+ hours', target: 31, checks: defaultChecks[0], color: '#4ADE80' },
    { id: 'h2', name: 'Drink 2L of water', target: 31, checks: defaultChecks[1], color: '#38BDF8' },
    { id: 'h3', name: 'Morning sunlight', target: 31, checks: defaultChecks[2], color: '#FACC15' },
    { id: 'h4', name: 'No added sugar', target: 31, checks: defaultChecks[3], color: '#FB923C' },
    { id: 'h5', name: 'Read 20 pages', target: 31, checks: defaultChecks[4], color: '#F472B6' },
    { id: 'h6', name: 'Move for 30 mins', target: 31, checks: defaultChecks[5], color: '#C084FC' },
    { id: 'h7', name: 'Eat my greens', target: 31, checks: defaultChecks[6], color: '#34D399' },
    { id: 'h8', name: 'Meditate 10 mins', target: 31, checks: defaultChecks[7], color: '#818CF8' },
    { id: 'h9', name: 'Phone off by 10pm', target: 31, checks: defaultChecks[8], color: '#F87171' },
    { id: 'h10', name: 'Journal', target: 31, checks: defaultChecks[9], color: '#E879F9' },
    { id: 'h11', name: '20min night walk at park', target: 31, checks: defaultChecks[10], color: '#2DD4BF' },
    { id: 'h12', name: 'Time with family', target: 31, checks: defaultChecks[11], color: '#F43F5E' },
    { id: 'h13', name: 'No coffee till 12pm', target: 31, checks: defaultChecks[12], color: '#A78BFA' },
  ],
  wellness: {
    moods: defaultMoods,
    weather: defaultWeather,
    sleepHours: defaultSleepHours,
  },
  weeklyBlocks: [
    {
      weekNumber: 1,
      title: 'Week 1 Focus',
      daysRange: 'Days 1–7',
      accentColor: '#F472B6',
      darkFill: '#3B2030',
      tasks: [
        { id: 'w1_1', title: 'Meal prep for work week', completed: true },
        { id: 'w1_2', title: 'Deep clean kitchen & sink', completed: true },
        { id: 'w1_3', title: 'Attend 60m Yoga class', completed: true },
        { id: 'w1_4', title: 'Weekly budget review', completed: true },
        { id: 'w1_5', title: 'Call grandparents', completed: false },
      ],
    },
    {
      weekNumber: 2,
      title: 'Week 2 Focus',
      daysRange: 'Days 8–14',
      accentColor: '#FB923C',
      darkFill: '#3A281C',
      tasks: [
        { id: 'w2_1', title: 'Plan weekend road trip', completed: true },
        { id: 'w2_2', title: 'Laundry & wardrobe reset', completed: true },
        { id: 'w2_3', title: '5km outdoor trail run', completed: true },
        { id: 'w2_4', title: 'Zero inbox Friday sprint', completed: false },
        { id: 'w2_5', title: 'Book club chapter 4', completed: true },
      ],
    },
    {
      weekNumber: 3,
      title: 'Week 3 Focus',
      daysRange: 'Days 15–21',
      accentColor: '#FACC15',
      darkFill: '#38321A',
      tasks: [
        { id: 'w3_1', title: 'Grocery restock & batch cook', completed: true },
        { id: 'w3_2', title: 'Car wash & vacuum interior', completed: true },
        { id: 'w3_3', title: 'Strength training PR test', completed: true },
        { id: 'w3_4', title: 'Review monthly investments', completed: true },
        { id: 'w3_5', title: 'Digital photos backup to Drive', completed: true },
      ],
    },
    {
      weekNumber: 4,
      title: 'Week 4 Focus',
      daysRange: 'Days 22–28',
      accentColor: '#38BDF8',
      darkFill: '#1A2F3D',
      tasks: [
        { id: 'w4_1', title: 'Pantry inventory & toss expired', completed: true },
        { id: 'w4_2', title: 'Deep clean bedroom & bedding', completed: true },
        { id: 'w4_3', title: 'Daily 15min mobility / stretch', completed: true },
        { id: 'w4_4', title: 'Subscription audit & cancel unused', completed: false },
        { id: 'w4_5', title: 'Host family homemade dinner', completed: true },
      ],
    },
    {
      weekNumber: 5,
      title: 'Week 5 Sprint',
      daysRange: 'Days 29–31',
      accentColor: '#C084FC',
      darkFill: '#2D1F3F',
      tasks: [
        { id: 'w5_1', title: 'Monthly retrospective review', completed: true },
        { id: 'w5_2', title: 'Next month habit blueprint setup', completed: true },
        { id: 'w5_3', title: 'Financial month-end reconciliation', completed: false },
      ],
    },
  ],
  monthlyGoals: [
    { id: 'm1', title: 'Complete annual medical & dental check-up', category: 'Health', completed: true },
    { id: 'm2', title: 'Backup cloud storage & offload phone camera roll', category: 'Tech', completed: true },
    { id: 'm3', title: 'Review recurring bank subscriptions & save $150', category: 'Finance', completed: true },
    { id: 'm4', title: 'Deep clean master bedroom & reorganize closet', category: 'Home', completed: true },
    { id: 'm5', title: 'Donate 2 boxes of unused clothing & gear', category: 'Home', completed: true },
    { id: 'm6', title: 'Change HVAC air filters & water purifier cartridge', category: 'Home', completed: true },
    { id: 'm7', title: 'Polish leather dress shoes and conditioning', category: 'Care', completed: false },
    { id: 'm8', title: 'Clean & lube road bike drivetrain + tire check', category: 'Fitness', completed: true },
    { id: 'm9', title: 'Organize digital desktop, downloads & cloud drives', category: 'Tech', completed: true },
    { id: 'm10', title: 'Schedule semi-annual dental scaling', category: 'Health', completed: true },
    { id: 'm11', title: 'Test home smoke detectors & carbon monoxide alarms', category: 'Safety', completed: true },
    { id: 'm12', title: 'Ship surprise care package to childhood friend', category: 'Social', completed: true },
    { id: 'm13', title: 'Deposit surplus into high-yield emergency buffer', category: 'Finance', completed: true },
    { id: 'm14', title: 'Finalize itinerary & booking for Spring mountain hike', category: 'Leisure', completed: false },
  ],
  extraTasks: [
    { id: 'e1', title: 'Schedule car scheduled 30,000 km maintenance', completed: true },
    { id: 'e2', title: 'Return online shoes parcel at post drop-off', completed: true },
    { id: 'e3', title: 'Order replacement insulated steel gym bottle', completed: false },
    { id: 'e4', title: 'Pick up dry cleaning tailored blazer', completed: false },
  ],
  reflection: {
    nutritionalTiming: 'Early morning coffee = afternoon energy crash. Waiting until 12pm stabilized focus dramatically.',
    environmental: 'Sunny mornings correlate with calmer days and higher workout consistency.',
    sleepRecovery: 'Late evening screen time directly predicts tired morning states. Phone off by 10pm was key.',
    actionableAdjustments: 'Enforce phone shutdown by 10:00 PM next month to protect sleep duration and morning walks.',
    monthlyWins: 'Hit 26 days of 7+ hours sleep and maintained a 14-day streak on morning sunlight!',
    monthlyLearnings: 'Consistency beats intensity. Breaking habits into micro-steps kept momentum even on busy travel days.',
  },
};
