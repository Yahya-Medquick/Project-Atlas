import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  Auth
} from "firebase/auth";
import { getOrCreateDeviceId } from "../utils/deviceFingerprint";

const isProduction = import.meta.env.PROD;
if (!isProduction) {
  // Only in development: log warning that real OTP will not send
  console.warn('[DEV] Firebase phone auth may use test credentials');
}

let app: any = null;
let auth: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (!auth) {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

    if (!apiKey || !authDomain || !projectId) {
      throw new Error(
        'Firebase configuration error: Missing required environment variables (VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID).'
      );
    }

    const firebaseConfig = {
      apiKey,
      authDomain,
      projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    };

    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  }
  return auth;
}

export { getOrCreateDeviceId };

// In-Memory Confirmation Handler Storage
let currentConfirmationResult: ConfirmationResult | null = null;

// Initialize or get reCAPTCHA verifier
export function getRecaptchaVerifier(containerId = "recaptcha-container"): RecaptchaVerifier {
  const authInstance = getFirebaseAuth();
  
  // Clear any existing window instance if needed
  if ((window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch (e) {
      console.warn("Recaptcha verifier clear notice:", e);
    }
  }

  const verifier = new RecaptchaVerifier(authInstance, containerId, {
    size: "invisible",
    callback: () => {
      console.log("[Firebase Phone Auth] reCAPTCHA verified");
    },
    "expired-callback": () => {
      console.warn("[Firebase Phone Auth] reCAPTCHA expired, please re-trigger.");
    },
  });

  (window as any).recaptchaVerifier = verifier;
  return verifier;
}

/**
 * Trigger Firebase Phone Auth OTP dispatch.
 * Sends OTP to the given phone number (+1234567890).
 */
export async function sendFirebasePhoneOtp(
  phoneNumber: string,
  containerId = "recaptcha-container"
): Promise<{ success: boolean; message?: string }> {
  const cleanPhone = phoneNumber.trim().replace(/[\s()-]/g, "");

  try {
    const authInstance = getFirebaseAuth();
    const verifier = getRecaptchaVerifier(containerId);
    const confirmation = await signInWithPhoneNumber(authInstance, cleanPhone, verifier);
    currentConfirmationResult = confirmation;
    return { success: true, message: "OTP sent via SMS." };
  } catch (error: any) {
    console.error('[Firebase OTP Error]', error);
    throw new Error(
      error?.code === 'auth/invalid-app-credential' 
        ? 'OTP service configuration error. Please contact support.'
        : error?.code === 'auth/too-many-requests'
        ? 'Too many OTP attempts. Please wait before trying again.'
        : 'Failed to send OTP. Please check your phone number and try again.'
    );
  }
}

/**
 * Verify entered OTP code.
 */
export async function verifyFirebasePhoneOtp(otpCode: string): Promise<boolean> {
  const cleanCode = otpCode.trim();

  if (!currentConfirmationResult) {
    throw new Error("No active verification session found. Please request a new OTP code.");
  }

  try {
    const result = await currentConfirmationResult.confirm(cleanCode);
    return !!result.user;
  } catch (error: any) {
    console.error("[Firebase Phone Auth] Verification error:", error);
    throw new Error(
      error?.code === 'auth/invalid-verification-code'
        ? 'Invalid verification code. Please check and try again.'
        : error?.code === 'auth/code-expired'
        ? 'Verification code has expired. Please request a new one.'
        : error?.message || 'Invalid verification code. Please check and try again.'
    );
  }
}
