import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { DriveFileItem, HabitTrackerState } from '../types/habit';
import {
  listSpreadsheetsFromDrive,
  createHabitTrackerSheet,
  syncToExistingSheet,
} from '../services/googleSheetsService';
import {
  X,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  FolderOpen,
  Search,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSignIn: () => void;
  getAccessToken: () => Promise<string | null>;
  state: HabitTrackerState;
  connectedSpreadsheetUrl: string | null;
  connectedSpreadsheetName: string | null;
  onSetConnectedSpreadsheet: (url: string, name: string) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  user,
  onSignIn,
  getAccessToken,
  state,
  connectedSpreadsheetUrl,
  connectedSpreadsheetName,
  onSetConnectedSpreadsheet,
}) => {
  const [spreadsheets, setSpreadsheets] = useState<DriveFileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdatingExisting, setIsUpdatingExisting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Confirmation state for updating existing sheet
  const [pendingUpdateFile, setPendingUpdateFile] = useState<DriveFileItem | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadDriveFiles();
    }
  }, [isOpen, user]);

  const loadDriveFiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Please sign in with Google to access your Drive.');
      }
      const files = await listSpreadsheetsFromDrive(token);
      setSpreadsheets(files);
    } catch (err: any) {
      console.error('Error listing spreadsheets from Drive:', err);
      setError(err.message || 'Failed to list Google Sheets from Drive');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = async () => {
    setIsCreating(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Please sign in with Google first.');
      const result = await createHabitTrackerSheet(token, state);
      onSetConnectedSpreadsheet(result.spreadsheetUrl, `Habit Tracker Pro - ${state.monthName} ${state.year}`);
      setSuccessMessage('Successfully created Dark-Mode Habit Tracker Pro in your Google Drive!');
      // Reload drive files list
      await loadDriveFiles();
    } catch (err: any) {
      console.error('Error creating spreadsheet:', err);
      setError(err.message || 'Failed to create spreadsheet');
    } finally {
      setIsCreating(false);
    }
  };

  // Triggered when user confirms updating an existing sheet from Drive
  const handleConfirmUpdateExisting = async () => {
    if (!pendingUpdateFile) return;
    setIsUpdatingExisting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Please sign in with Google first.');
      await syncToExistingSheet(token, pendingUpdateFile.id, state);
      const sheetUrl = pendingUpdateFile.webViewLink || `https://docs.google.com/spreadsheets/d/${pendingUpdateFile.id}/edit`;
      onSetConnectedSpreadsheet(sheetUrl, pendingUpdateFile.name);
      setSuccessMessage(`Successfully updated "${pendingUpdateFile.name}" with Habit Tracker Pro template & data!`);
      setPendingUpdateFile(null);
    } catch (err: any) {
      console.error('Error updating existing spreadsheet:', err);
      setError(err.message || 'Failed to update existing spreadsheet');
    } finally {
      setIsUpdatingExisting(false);
    }
  };

  if (!isOpen) return null;

  const filteredFiles = spreadsheets.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1E1E24] border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 lg:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F4F4F5]">Google Drive & Sheets Integration</h3>
              <p className="text-xs text-[#A1A1AA]">
                Connect to existing spreadsheets in your Drive or create a new automated sheet
              </p>
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
        <div className="p-4 lg:p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {/* If user is not signed in */}
          {!user ? (
            <div className="bg-[#121214] border border-zinc-800 rounded-xl p-6 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-emerald-950/60 text-emerald-400 flex items-center justify-center mb-3">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#F4F4F5] mb-1">Sign in with Google</h4>
              <p className="text-xs text-[#A1A1AA] max-w-md mb-4">
                To generate the Habit Tracker Pro spreadsheet in your Google Drive or use your existing sheet, please connect your Google account.
              </p>
              <button
                type="button"
                onClick={onSignIn}
                className="flex items-center gap-2.5 px-4 py-2 bg-white hover:bg-zinc-100 text-zinc-800 font-medium text-xs rounded-lg transition shadow cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>Sign in with Google</span>
              </button>

              <div className="mt-4 pt-3 border-t border-zinc-800/80 w-full max-w-sm text-left">
                <details className="text-[11px] text-zinc-400 group">
                  <summary className="cursor-pointer hover:text-zinc-200 transition font-medium">
                    Having trouble with browser popup? (Manual Token)
                  </summary>
                  <div className="mt-2 flex flex-col gap-2 p-2.5 rounded-lg bg-[#18181D] border border-zinc-800">
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      If third-party cookies or browser popup blockers block authentication, paste an OAuth Bearer token with Sheets & Drive scopes below:
                    </p>
                    <div className="flex gap-1.5">
                      <input
                        type="password"
                        placeholder="Paste ya29... token"
                        id="manual-token-input"
                        className="flex-1 bg-[#121214] border border-zinc-700 px-2 py-1 rounded text-xs text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const input = document.getElementById('manual-token-input') as HTMLInputElement;
                          if (input?.value) {
                            try {
                              const { setManualAccessToken } = await import('../services/firebaseAuth');
                              await setManualAccessToken(input.value);
                              setSuccessMessage('Access token applied successfully!');
                            } catch (e: any) {
                              setError(e.message || 'Failed to apply token');
                            }
                          }
                        }}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[11px] font-bold"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          ) : (
            <>
              {/* Connected Sheet Status Banner */}
              {connectedSpreadsheetUrl ? (
                <div className="bg-[#133E2B]/50 border border-emerald-800/80 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-emerald-300">Active Linked Sheet</span>
                      <p className="text-[11px] text-zinc-300 truncate max-w-sm">
                        {connectedSpreadsheetName || 'Google Sheet'}
                      </p>
                    </div>
                  </div>
                  <a
                    href={connectedSpreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition"
                  >
                    <span>Open in Sheets</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : null}

              {/* Action 1: Create New Sheet in Google Drive */}
              <div className="bg-[#121214] p-4 rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#F4F4F5]">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    <span>Create New Dark-Mode Habit Tracker Pro in Google Drive</span>
                  </div>
                  <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                    Generates a new spreadsheet with all 13 routines, 5 pastel weekly blocks, formulas, and conditional rules.
                  </p>
                </div>
                <button
                  onClick={handleCreateNew}
                  disabled={isCreating}
                  className="flex items-center gap-2 px-3.5 py-2 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition shrink-0 cursor-pointer shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isCreating ? 'Creating in Drive...' : 'Generate New Sheet'}</span>
                </button>
              </div>

              {/* Action 2: Use existing Google Sheet from Drive */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-zinc-200">
                      Or Select an Existing Google Sheet from Your Drive
                    </span>
                  </div>
                  <button
                    onClick={loadDriveFiles}
                    disabled={isLoading}
                    className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition"
                    title="Refresh Drive files"
                    aria-label="Refresh Drive files"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Search bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search spreadsheets in your Google Drive..."
                    className="w-full bg-[#121214] text-xs text-[#F4F4F5] pl-8 pr-3 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:border-zinc-700"
                  />
                </div>

                {/* Spreadsheets List */}
                <div className="border border-zinc-800 rounded-xl bg-[#121214] max-h-56 overflow-y-auto divide-y divide-zinc-800/60">
                  {isLoading ? (
                    <div className="p-6 text-center text-xs text-zinc-500 font-mono flex items-center justify-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                      <span>Reading spreadsheets from Google Drive...</span>
                    </div>
                  ) : filteredFiles.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-500">
                      {searchQuery ? 'No matching spreadsheets found' : 'No Google Sheets found in your Google Drive'}
                    </div>
                  ) : (
                    filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-3 hover:bg-[#18181D] flex items-center justify-between gap-3 transition"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div className="truncate">
                            <span className="text-xs font-medium text-zinc-200 block truncate" title={file.name}>
                              {file.name}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              Modified {new Date(file.modifiedTime).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition"
                            title="Preview in Google Sheets"
                            aria-label={`Preview ${file.name} in Google Sheets`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => setPendingUpdateFile(file)}
                            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-emerald-800/60 text-zinc-200 hover:text-emerald-300 text-[11px] font-semibold border border-zinc-700 transition"
                          >
                            Use This Sheet
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Status / feedback messages */}
              {successMessage && (
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mandatory User Confirmation Dialog for Mutating an Existing Drive Spreadsheet */}
        {pendingUpdateFile && (
          <div className="p-4 bg-[#231A1C] border-t border-red-900/60 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Confirm Populating Existing Google Sheet</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to write the Dark-Mode Habit Tracker Pro layout, formulas, and data into{' '}
              <strong className="text-white">"{pendingUpdateFile.name}"</strong>? This will create or update the sheet tab with 31 calendar columns, 13 habits, and wellness trackers.
            </p>
            <div className="flex items-center justify-end gap-2 mt-1">
              <button
                onClick={() => setPendingUpdateFile(null)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpdateExisting}
                disabled={isUpdatingExisting}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                {isUpdatingExisting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Confirm & Apply to Sheet</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Synced via Google Sheets API & Google Drive API</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
