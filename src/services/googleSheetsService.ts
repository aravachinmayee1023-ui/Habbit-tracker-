import { HabitTrackerState, DriveFileItem } from '../types/habit';
import { WEEK_PALETTES } from '../data/defaultData';

export function hexToRgbColor(hex: string) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return { red: r, green: g, blue: b };
}

/**
 * Searches the user's Google Drive for existing Google Sheets.
 */
export async function listSpreadsheetsFromDrive(accessToken: string): Promise<DriveFileItem[]> {
  const query = encodeURIComponent("mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,modifiedTime,webViewLink)&orderBy=modifiedTime desc&pageSize=30`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to list spreadsheets from Google Drive: ${errorText}`);
  }

  const data = await res.json();
  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    modifiedTime: f.modifiedTime,
    webViewLink: f.webViewLink || `https://docs.google.com/spreadsheets/d/${f.id}/edit`,
  }));
}

/**
 * Generates the complete Google Sheets batchUpdate request payload for Habit Tracker Pro.
 */
export function buildHabitTrackerBatchUpdateRequests(sheetId: number, state: HabitTrackerState): any[] {
  const requests: any[] = [];

  // 1. Grid Properties: set dimensions, tab title, and freeze rows/cols
  requests.push({
    updateSheetProperties: {
      properties: {
        sheetId,
        title: `${state.monthName} ${state.year}`,
        gridProperties: {
          rowCount: 90,
          columnCount: 42, // Columns A through AP
          frozenRowCount: 14,
          frozenColumnCount: 2, // Freeze Column A & B (Habit description)
        },
        tabColorStyle: {
          rgbColor: hexToRgbColor('#F472B6'),
        },
      },
      fields: 'title,gridProperties.rowCount,gridProperties.columnCount,gridProperties.frozenRowCount,gridProperties.frozenColumnCount,tabColorStyle',
    },
  });

  // 2. Set Column Widths
  // Col 0 (A): 28px
  // Col 1 (B): 160px
  // Col 2..32 (C..AG - Days 1..31): 24px each
  // Col 33 (AH - Target): 42px
  // Col 34 (AI - Done): 42px
  // Col 35 (AJ - %): 48px
  // Col 36 (AK - Streak): 45px
  // Col 37 (AL - Sparkline): 90px
  requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 },
      properties: { pixelSize: 28 },
      fields: 'pixelSize',
    },
  });
  requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 },
      properties: { pixelSize: 160 },
      fields: 'pixelSize',
    },
  });
  requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: 'COLUMNS', startIndex: 2, endIndex: 33 },
      properties: { pixelSize: 24 },
      fields: 'pixelSize',
    },
  });
  requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: 'COLUMNS', startIndex: 33, endIndex: 34 },
      properties: { pixelSize: 42 },
      fields: 'pixelSize',
    },
  });
  requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: 'COLUMNS', startIndex: 34, endIndex: 35 },
      properties: { pixelSize: 42 },
      fields: 'pixelSize',
    },
  });
  requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: 'COLUMNS', startIndex: 35, endIndex: 36 },
      properties: { pixelSize: 48 },
      fields: 'pixelSize',
    },
  });
  requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: 'COLUMNS', startIndex: 36, endIndex: 37 },
      properties: { pixelSize: 45 },
      fields: 'pixelSize',
    },
  });
  requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: 'COLUMNS', startIndex: 37, endIndex: 38 },
      properties: { pixelSize: 90 },
      fields: 'pixelSize',
    },
  });

  // 3. Global Canvas background fill #121214 for the operational matrix
  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 0, endRowIndex: 85, startColumnIndex: 0, endColumnIndex: 40 },
      cell: {
        userEnteredFormat: {
          backgroundColor: hexToRgbColor('#121214'),
          textFormat: {
            fontFamily: 'Roboto',
            foregroundColor: hexToRgbColor('#F4F4F5'),
            fontSize: 9,
          },
        },
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat)',
    },
  });

  // 4. Data Validation for Mood (Row 29: C30:AG30)
  requests.push({
    setDataValidation: {
      range: { sheetId, startRowIndex: 29, endRowIndex: 30, startColumnIndex: 2, endColumnIndex: 33 },
      rule: {
        condition: {
          type: 'ONE_OF_LIST',
          values: [
            { userEnteredValue: '😊 Happy' },
            { userEnteredValue: '🥰 Loved' },
            { userEnteredValue: '😌 Calm' },
            { userEnteredValue: '😐 Okay' },
            { userEnteredValue: '🥱 Tired' },
            { userEnteredValue: '😢 Sad' },
            { userEnteredValue: '😫 Stressed' },
          ],
        },
        strict: true,
        showCustomUi: true,
      },
    },
  });

  // 5. Data Validation for Weather (Row 30: C31:AG31)
  requests.push({
    setDataValidation: {
      range: { sheetId, startRowIndex: 30, endRowIndex: 31, startColumnIndex: 2, endColumnIndex: 33 },
      rule: {
        condition: {
          type: 'ONE_OF_LIST',
          values: [
            { userEnteredValue: '☀️ Sunny' },
            { userEnteredValue: '⛅ P.Cloudy' },
            { userEnteredValue: '☁️ Cloudy' },
            { userEnteredValue: '🌧️ Rainy' },
            { userEnteredValue: '⛈️ Stormy' },
            { userEnteredValue: '🌬️ Windy' },
            { userEnteredValue: '❄️ Snowy' },
          ],
        },
        strict: true,
        showCustomUi: true,
      },
    },
  });

  // 6. Data Validation for Checkboxes in Main Matrix (Rows 14..27, Cols 2..33)
  requests.push({
    setDataValidation: {
      range: { sheetId, startRowIndex: 14, endRowIndex: 27, startColumnIndex: 2, endColumnIndex: 33 },
      rule: {
        condition: { type: 'BOOLEAN' },
        showCustomUi: true,
      },
    },
  });

  // 7. Data Validation for Sleep hours (Row 31: C32:AG32, number between 0 and 24)
  requests.push({
    setDataValidation: {
      range: { sheetId, startRowIndex: 31, endRowIndex: 32, startColumnIndex: 2, endColumnIndex: 33 },
      rule: {
        condition: {
          type: 'NUMBER_BETWEEN',
          values: [{ userEnteredValue: '0' }, { userEnteredValue: '24' }],
        },
        strict: true,
        showCustomUi: true,
      },
    },
  });

  // 8. Conditional Formatting: Sleep Benchmark Rules
  // Optimal: >= 7.0 (Dark Emerald #133E2B, Mint Green #4ADE80)
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId, startRowIndex: 31, endRowIndex: 32, startColumnIndex: 2, endColumnIndex: 33 }],
        booleanRule: {
          condition: {
            type: 'CUSTOM_FORMULA',
            values: [{ userEnteredValue: '=AND(ISNUMBER(C32), C32 >= 7)' }],
          },
          format: {
            backgroundColor: hexToRgbColor('#133E2B'),
            textFormat: { foregroundColor: hexToRgbColor('#4ADE80'), bold: true },
          },
        },
      },
      index: 0,
    },
  });

  // Caution: 6.0 <= x < 7.0 (Dark Amber #3D3214, Amber Yellow #FBBF24)
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId, startRowIndex: 31, endRowIndex: 32, startColumnIndex: 2, endColumnIndex: 33 }],
        booleanRule: {
          condition: {
            type: 'CUSTOM_FORMULA',
            values: [{ userEnteredValue: '=AND(ISNUMBER(C32), C32 >= 6, C32 < 7)' }],
          },
          format: {
            backgroundColor: hexToRgbColor('#3D3214'),
            textFormat: { foregroundColor: hexToRgbColor('#FBBF24'), bold: true },
          },
        },
      },
      index: 1,
    },
  });

  // Deficit: < 6.0 (Dark Wine #3E1A1A, Coral Red #F87171)
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId, startRowIndex: 31, endRowIndex: 32, startColumnIndex: 2, endColumnIndex: 33 }],
        booleanRule: {
          condition: {
            type: 'CUSTOM_FORMULA',
            values: [{ userEnteredValue: '=AND(ISNUMBER(C32), C32 < 6)' }],
          },
          format: {
            backgroundColor: hexToRgbColor('#3E1A1A'),
            textFormat: { foregroundColor: hexToRgbColor('#F87171'), bold: true },
          },
        },
      },
      index: 2,
    },
  });

  // 9. Conditional Formatting for Checkbox weekly pastel active fills
  WEEK_PALETTES.forEach((wp, idx) => {
    requests.push({
      addConditionalFormatRule: {
        rule: {
          ranges: [
            {
              sheetId,
              startRowIndex: 14,
              endRowIndex: 27,
              startColumnIndex: wp.startDay + 2,
              endColumnIndex: wp.endDay + 3,
            },
          ],
          booleanRule: {
            condition: {
              type: 'CUSTOM_FORMULA',
              // e.g. =C15=TRUE
              values: [
                {
                  userEnteredValue: `=${String.fromCharCode(67 + wp.startDay)}15=TRUE`,
                },
              ],
            },
            format: {
              backgroundColor: hexToRgbColor(wp.darkFill),
              textFormat: { foregroundColor: hexToRgbColor(wp.accentColor), bold: true },
            },
          },
        },
        index: 3 + idx,
      },
    });
  });

  return requests;
}

/**
 * Builds the cell values matrix to update all rows and formulas in Google Sheets.
 */
export function buildHabitTrackerValuesPayload(state: HabitTrackerState): { range: string; values: any[][] } {
  const values: any[][] = [];

  // Helper to pad row to 38 columns
  const padRow = (arr: any[]): any[] => {
    const copy = [...arr];
    while (copy.length < 38) copy.push('');
    return copy;
  };

  // Row 1: Executive Title
  values.push(padRow(['', `✨ ${state.monthNumber} / ${state.monthName.toUpperCase()} ${state.year} / MY HABIT JOURNEY PRO SPREADSHEET`]));
  
  // Row 2: User greeting & instructions
  values.push(padRow(['', `Hi, ${state.userName}! ${state.greetingSubtext} — Dark-Mode Habit & Wellness Operational Dashboard`]));

  // Row 3: Blank
  values.push(padRow([]));

  // Row 4: Executive KPI Cards Header
  values.push(padRow(['', 'MACRO PERFORMANCE GAUGES', '', '', '', 'CHRONOBIOLOGICAL SUMMARY', '', '', '', 'MOOD PROFILE']));

  // Row 5: KPI Formulas & Stats
  // Division formula: =SUM(AI15:AI27)/SUM(AH15:AH27)
  values.push(padRow([
    '',
    'Daily Habits Completion Rate:',
    '=SUM(AI15:AI27)/SUM(AH15:AH27)',
    '',
    '',
    'Mean Sleep Duration:',
    '=AVERAGE(C32:AG32)',
    'Optimal Sleep Days (≥7h):',
    '=COUNTIF(C32:AG32, ">=7")',
    'Happy Mood Frequency:',
    '=COUNTIF(C30:AG30, "😊 Happy")',
  ]));

  // Row 6: Weekly routines rate and monthly goals rate
  values.push(padRow([
    '',
    'Weekly Routines Completion:',
    '=COUNTIF(C46:C50, TRUE)/5',
    '',
    '',
    'Longest Active Habit Streak:',
    '=MAX(AK15:AK27)',
    'Total Habits Tracked:',
    '13 routines',
    'Weather Sunny Days:',
    '=COUNTIF(C31:AG31, "☀️ Sunny")',
  ]));

  // Rows 7-11: Empty / spacer
  for (let r = 7; r <= 11; r++) {
    values.push(padRow([]));
  }

  // Row 12: Section Title
  values.push(padRow(['', 'DAILY HABIT EXECUTION MATRIX & GROWTH VISUALIZER']));

  // Row 13: Pine Tree Growth Visualizer Row (Row 13 in 1-indexed, or 12 in 0-indexed)
  // Evaluates daily task count row 28
  const treeRow: any[] = ['', '🌱 Growth Visualizer'];
  for (let day = 1; day <= 31; day++) {
    const colLetter = getColumnLetter(day + 1); // C is 3 (index 2) -> day 1 is C
    treeRow.push(`=IFS(${colLetter}28=0, "", ${colLetter}28<=4, "🌱", ${colLetter}28<=8, "🌲", ${colLetter}28<=11, "🌳", ${colLetter}28>11, "🌴")`);
  }
  treeRow.push('Target', 'Done', '%', 'Streak', 'Sparkline Progress');
  values.push(padRow(treeRow));

  // Row 14: Day Numbers & Calendar Headers
  const headerRow: any[] = ['', 'Habit Routine'];
  for (let day = 1; day <= 31; day++) {
    headerRow.push(day);
  }
  headerRow.push('AH (Goal)', 'AI (Done)', 'AJ (%)', 'AK (Strk)', 'AL (Sparkline)');
  values.push(padRow(headerRow));

  // Rows 15..27: 13 Daily Habits
  state.habits.slice(0, 13).forEach((h, idx) => {
    const rowNum = 15 + idx;
    const rowData: any[] = ['', h.name];
    for (let day = 0; day < 31; day++) {
      rowData.push(h.checks[day] ? true : false);
    }
    // Summary columns:
    // AH: Target
    rowData.push(h.target);
    // AI: Completed Days: =COUNTIF(C{row}:AG{row}, TRUE)
    rowData.push(`=COUNTIF(C${rowNum}:AG${rowNum}, TRUE)`);
    // AJ: %: =IFERROR(AI{row}/AH{row}, 0)
    rowData.push(`=IFERROR(AI${rowNum}/AH${rowNum}, 0)`);
    // AK: Streak: =IFERROR(COLUMNS(C{row}:AG{row}) - MAX(FILTER(COLUMN(C{row}:AG{row}) - COLUMN(C{row}) + 1, C{row}:AG{row} = FALSE)), COUNTIF(C{row}:AG{row}, TRUE))
    rowData.push(`=IFERROR(COLUMNS(C${rowNum}:AG${rowNum}) - MAX(FILTER(COLUMN(C${rowNum}:AG${rowNum}) - COLUMN(C${rowNum}) + 1, C${rowNum}:AG${rowNum} = FALSE)), COUNTIF(C${rowNum}:AG${rowNum}, TRUE))`);
    // AL: Sparkline Progress Bar: =SPARKLINE(AI{row}, {"charttype", "bar"; "max", AH{row}; "color1", "#F472B6"})
    const sparkColor = h.color || '#F472B6';
    rowData.push(`=SPARKLINE(AI${rowNum}, {"charttype", "bar"; "max", AH${rowNum}; "color1", "${sparkColor}"})`);

    values.push(padRow(rowData));
  });

  // Row 28: Daily Task Count: =COUNTIF(C15:C27, TRUE)
  const taskCountRow: any[] = ['', 'Daily Completed Ticks'];
  for (let day = 1; day <= 31; day++) {
    const colLetter = getColumnLetter(day + 1);
    taskCountRow.push(`=COUNTIF(${colLetter}15:${colLetter}27, TRUE)`);
  }
  taskCountRow.push('Total Target: 403', '=SUM(AI15:AI27)', '=IFERROR(AI28/403, 0)', '', '');
  values.push(padRow(taskCountRow));

  // Row 29: Divider
  values.push(padRow(['', 'WELLNESS & CHRONOBIOLOGICAL TRACKING LAYER']));

  // Row 30: Daily Mood Tracker
  const moodRow: any[] = ['', 'Mood Tracker'];
  for (let day = 0; day < 31; day++) {
    moodRow.push(state.wellness.moods[day] || '');
  }
  values.push(padRow(moodRow));

  // Row 31: Daily Weather Tracker
  const weatherRow: any[] = ['', 'Weather Tracker'];
  for (let day = 0; day < 31; day++) {
    weatherRow.push(state.wellness.weather[day] || '');
  }
  values.push(padRow(weatherRow));

  // Row 32: Sleep Duration (Hours)
  const sleepRow: any[] = ['', 'Sleep Duration (Hours)'];
  for (let day = 0; day < 31; day++) {
    const hours = state.wellness.sleepHours[day];
    sleepRow.push(hours !== null && hours !== undefined ? hours : '');
  }
  sleepRow.push('Avg Bench: 7.0h', '=AVERAGE(C32:AG32)', '=COUNTIF(C32:AG32, ">=7")', 'Optimal', '');
  values.push(padRow(sleepRow));

  // Row 33: Spacer
  values.push(padRow([]));

  // Row 34: Section Title for Analytics Hub
  values.push(padRow(['', 'ANALYTICAL DISTRIBUTION HUB (MOOD & WEATHER FREQUENCIES)']));

  // Row 35..41: Frequency tables
  const moodLabels = ['😊 Happy', '🥰 Loved', '😌 Calm', '😐 Okay', '🥱 Tired', '😢 Sad', '😫 Stressed'];
  const weatherLabels = ['☀️ Sunny', '⛅ P.Cloudy', '☁️ Cloudy', '🌧️ Rainy', '⛈️ Stormy', '🌬️ Windy', '❄️ Snowy'];

  for (let i = 0; i < 7; i++) {
    values.push(padRow([
      '',
      moodLabels[i],
      `=COUNTIF($C$30:$AG$30, "${moodLabels[i]}")`,
      '',
      weatherLabels[i],
      `=COUNTIF($C$31:$AG$31, "${weatherLabels[i]}")`,
    ]));
  }

  // Row 42: Spacer
  values.push(padRow([]));

  // Row 43: Section Title: Multi-Horizon Task Management
  values.push(padRow(['', 'MULTI-HORIZON TASK MANAGEMENT TIER']));

  // Row 44: Weekly Focus Headers
  values.push(padRow(['', 'Week 1 Focus (Days 1–7)', '', 'Week 2 Focus (Days 8–14)', '', 'Week 3 Focus (Days 15–21)', '', 'Week 4 Focus (Days 22–28)', '', 'Week 5 Sprint (Days 29–31)']));

  // Rows 45..49: Weekly Tasks (5 items)
  for (let t = 0; t < 5; t++) {
    const wRow: any[] = [''];
    for (let w = 0; w < 5; w++) {
      const task = state.weeklyBlocks[w]?.tasks[t];
      wRow.push(task ? (task.completed ? true : false) : '');
      wRow.push(task ? task.title : '');
    }
    values.push(padRow(wRow));
  }

  // Row 50: Spacer
  values.push(padRow([]));

  // Row 51: Section: Monthly Checklist & Extra Administrative Tasks
  values.push(padRow(['', 'MONTHLY CHECKLIST (14 LIFE MILESTONES)', '', '', '', 'AD-HOC ADMINISTRATIVE TASKS']));

  // Rows 52..65: Monthly goals
  for (let m = 0; m < 14; m++) {
    const goal = state.monthlyGoals[m];
    const extra = state.extraTasks[m];
    values.push(padRow([
      '',
      goal ? (goal.completed ? true : false) : '',
      goal ? `[${goal.category}] ${goal.title}` : '',
      '',
      '',
      extra ? (extra.completed ? true : false) : '',
      extra ? extra.title : '',
    ]));
  }

  // Row 66: Spacer
  values.push(padRow([]));

  // Row 67: Section: Qualitative Reflection Synthesizer
  values.push(padRow(['', 'QUALITATIVE MOOD & WELLNESS REFLECTION SYNTHESIZER']));
  values.push(padRow(['', '1. Nutritional & Timing Influences:', state.reflection.nutritionalTiming]));
  values.push(padRow(['', '2. Environmental Influences:', state.reflection.environmental]));
  values.push(padRow(['', '3. Sleep & Recovery Factors:', state.reflection.sleepRecovery]));
  values.push(padRow(['', '4. Actionable Adjustments for Next Month:', state.reflection.actionableAdjustments]));
  values.push(padRow(['', '5. Monthly Habit Wins:', state.reflection.monthlyWins]));
  values.push(padRow(['', '6. Core Learnings:', state.reflection.monthlyLearnings]));

  return {
    range: `'${state.monthName} ${state.year}'!A1:AL${values.length}`,
    values,
  };
}

/**
 * Creates a brand new Habit Tracker Pro spreadsheet in the user's Google Drive.
 */
export async function createHabitTrackerSheet(
  accessToken: string,
  state: HabitTrackerState
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const createTitle = `Habit Tracker Pro - ${state.monthName} ${state.year}`;

  // Step 1: Create spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: createTitle,
      },
      sheets: [
        {
          properties: {
            title: `${state.monthName} ${state.year}`,
            sheetId: 0,
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Failed to create Google Sheet: ${errorText}`);
  }

  const createdData = await createRes.json();
  const spreadsheetId = createdData.spreadsheetId;
  const sheetId = createdData.sheets?.[0]?.properties?.sheetId ?? 0;

  // Step 2: Populate values and formulas
  await populateSheetValuesAndFormulas(accessToken, spreadsheetId, state);

  // Step 3: Apply batch styling, data validation, and conditional formatting
  await applyFormattingAndValidation(accessToken, spreadsheetId, sheetId, state);

  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Syncs the Habit Tracker state to an existing spreadsheet chosen from the user's Drive.
 */
export async function syncToExistingSheet(
  accessToken: string,
  spreadsheetId: string,
  state: HabitTrackerState
): Promise<void> {
  // First get spreadsheet metadata to find existing sheetId and title
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!metaRes.ok) {
    const errorText = await metaRes.text();
    throw new Error(`Failed to read spreadsheet metadata: ${errorText}`);
  }

  const metaData = await metaRes.json();
  const firstSheet = metaData.sheets?.[0]?.properties;
  const sheetId = firstSheet?.sheetId ?? 0;

  // Populate values
  await populateSheetValuesAndFormulas(accessToken, spreadsheetId, state);
  // Apply formatting
  await applyFormattingAndValidation(accessToken, spreadsheetId, sheetId, state);
}

async function populateSheetValuesAndFormulas(
  accessToken: string,
  spreadsheetId: string,
  state: HabitTrackerState
): Promise<void> {
  const payload = buildHabitTrackerValuesPayload(state);

  const valuesRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(payload.range)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: payload.range,
        majorDimension: 'ROWS',
        values: payload.values,
      }),
    }
  );

  if (!valuesRes.ok) {
    const errorText = await valuesRes.text();
    throw new Error(`Failed to populate spreadsheet cells: ${errorText}`);
  }
}

async function applyFormattingAndValidation(
  accessToken: string,
  spreadsheetId: string,
  sheetId: number,
  state: HabitTrackerState
): Promise<void> {
  const requests = buildHabitTrackerBatchUpdateRequests(sheetId, state);

  const batchRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });

  if (!batchRes.ok) {
    const errText = await batchRes.text();
    console.warn('BatchUpdate warning (applied partially):', errText);
  }
}

// Helper to convert column index to letter (0 -> A, 1 -> B, 2 -> C...)
function getColumnLetter(colIndexZeroBased: number): string {
  let temp = colIndexZeroBased;
  let letter = '';
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}
