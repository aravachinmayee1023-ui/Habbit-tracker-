import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive');
provider.setCustomParameters({
  prompt: 'select_account',
});

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;
// Cache the access token in memory (never localStorage / sessionStorage).
let cachedAccessToken: string | null = null;
let customUser: User | null = null;

// Auth state listeners
type AuthSuccessCallback = (user: User, token: string) => void;
type AuthFailureCallback = () => void;
const listeners: { success?: AuthSuccessCallback; failure?: AuthFailureCallback }[] = [];

export const initAuth = (
  onAuthSuccess?: AuthSuccessCallback,
  onAuthFailure?: AuthFailureCallback
) => {
  const listener = { success: onAuthSuccess, failure: onAuthFailure };
  listeners.push(listener);

  const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else if (customUser && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(customUser, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    }
  });

  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
    unsubscribe();
  };
};

function notifySuccess(user: User, token: string) {
  listeners.forEach((l) => l.success?.(user, token));
}

function notifyFailure() {
  listeners.forEach((l) => l.failure?.());
}

/**
 * Fallback to Google Identity Services (GIS) Token Client.
 * This directly opens the Google OAuth consent popup without relying on Firebase's internal
 * cross-origin iframe (which is blocked by modern browsers in third-party iframe environments).
 */
export const signInWithGoogleIdentityServices = (): Promise<{ user: User; accessToken: string }> => {
  return new Promise((resolve, reject) => {
    const clientId = firebaseConfig.oAuthClientId;
    if (!clientId) {
      return reject(new Error('OAuth Client ID is not configured in firebase-applet-config.json'));
    }

    // Ensure GIS script is loaded
    const checkGis = () => {
      const g = (window as any).google;
      if (!g?.accounts?.oauth2) {
        return false;
      }
      return true;
    };

    const triggerTokenFlow = () => {
      const g = (window as any).google;
      try {
        const tokenClient = g.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              return reject(new Error(`Google OAuth error: ${tokenResponse.error_description || tokenResponse.error}`));
            }

            const token = tokenResponse.access_token;
            if (!token) {
              return reject(new Error('No access token received from Google'));
            }

            cachedAccessToken = token;

            // Fetch user profile from Google userinfo endpoint
            let userInfo: any = {};
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (res.ok) {
                userInfo = await res.json();
              }
            } catch (err) {
              console.warn('Could not fetch userinfo:', err);
            }

            // Construct user profile representation
            const userObj: any = {
              uid: userInfo.sub || 'gis-user-' + Date.now(),
              email: userInfo.email || 'user@google.com',
              displayName: userInfo.name || 'Google User',
              photoURL: userInfo.picture || null,
            };

            customUser = userObj as User;

            // Attempt to bridge into Firebase Auth if possible
            try {
              const credential = GoogleAuthProvider.credential(null, token);
              const result = await signInWithCredential(auth, credential);
              cachedAccessToken = token;
              notifySuccess(result.user, token);
              resolve({ user: result.user, accessToken: token });
            } catch (fbErr) {
              // Even if Firebase Identity Toolkit is blocked by iframe partition,
              // we have the valid token and user profile for Google Drive and Sheets!
              notifySuccess(customUser, token);
              resolve({ user: customUser, accessToken: token });
            }
          },
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
      } catch (err) {
        reject(err);
      }
    };

    if (checkGis()) {
      triggerTokenFlow();
    } else {
      // Dynamically load script if not ready yet
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (checkGis()) {
          triggerTokenFlow();
        } else {
          reject(new Error('Failed to initialize Google Identity Services client'));
        }
      };
      script.onerror = () => {
        reject(new Error('Failed to load Google Identity Services SDK'));
      };
      document.head.appendChild(script);
    }
  });
};

/**
 * Main Google Sign In entry point.
 * Attempts Firebase signInWithPopup first.
 * If blocked by iframe third-party cookie restrictions (auth/network-request-failed),
 * seamlessly falls back to Google Identity Services token flow.
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;

    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) {
        throw new Error('Failed to obtain Google access token from Firebase credential');
      }

      cachedAccessToken = credential.accessToken;
      customUser = result.user;
      notifySuccess(result.user, cachedAccessToken);
      return { user: result.user, accessToken: cachedAccessToken };
    } catch (popupErr: any) {
      console.warn('Firebase signInWithPopup failed, falling back to Google Identity Services Token Client:', popupErr);
      // Fallback to GIS directly
      const gisResult = await signInWithGoogleIdentityServices();
      return gisResult;
    }
  } catch (error: any) {
    console.error('Google Sign In error:', error);
    notifyFailure();
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Manually set an OAuth Bearer access token (for user override / debug)
 */
export const setManualAccessToken = async (token: string, email?: string): Promise<{ user: User; accessToken: string }> => {
  cachedAccessToken = token.trim();
  let userInfo: any = {};
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${cachedAccessToken}` },
    });
    if (res.ok) {
      userInfo = await res.json();
    }
  } catch (e) {
    console.warn('Could not fetch userinfo for manual token:', e);
  }

  const userObj: any = {
    uid: userInfo.sub || 'token-user',
    email: userInfo.email || email || 'connected@google.com',
    displayName: userInfo.name || 'Connected User',
    photoURL: userInfo.picture || null,
  };

  customUser = userObj as User;
  notifySuccess(customUser, cachedAccessToken);
  return { user: customUser, accessToken: cachedAccessToken };
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    // ignore
  }
  cachedAccessToken = null;
  customUser = null;
  notifyFailure();
};
