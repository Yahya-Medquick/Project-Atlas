import React, { useState } from "react";
import {
  X,
  LogIn,
  ShieldCheck,
  CheckCircle2,
  User,
  Lock,
  Phone,
  ArrowRight,
  RotateCcw,
  Smartphone,
  Sparkles,
  KeyRound,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { useUser } from "../context/UserContext";
import {
  sendFirebasePhoneOtp,
  verifyFirebasePhoneOtp
} from "../services/firebaseAuth";
import { checkOtpRateLimit } from "../services/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin?: () => void;
}

type AuthView = "login" | "register" | "otp_verify";
type OtpContext = "registration" | "new_device";

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
}) => {
  const { loginUser, registerUser, verifyNewDeviceUser, continueAsGuest } = useUser();

  const [view, setView] = useState<AuthView>("login");
  const [otpContext, setOtpContext] = useState<OtpContext>("registration");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Form Fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [maskedPhoneDisplay, setMaskedPhoneDisplay] = useState("");

  // Rate Limit / Resend Timer
  const [resendCooldown, setResendCooldown] = useState(0);

  if (!isOpen) return null;

  // Format phone number helper
  const formatPhoneNumber = (val: string) => {
    let clean = val.trim();
    if (!clean.startsWith("+")) {
      clean = "+" + clean.replace(/\D/g, "");
    }
    return clean;
  };

  // 1. Handle Login (Username + Password only)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setIsLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const result = await loginUser(username.trim(), password);

      if (result.requiresOtp) {
        // New device detected! Trigger OTP flow
        const userPhone = result.phone || phoneNumber;
        setPhoneNumber(userPhone);
        setMaskedPhoneDisplay(result.phoneMasked || userPhone);
        setOtpContext("new_device");

        // Send OTP via Firebase Phone Auth
        const sendResult = await sendFirebasePhoneOtp(userPhone, "recaptcha-container");
        if (sendResult.message) {
          setInfoMessage(sendResult.message);
        }
        setView("otp_verify");
      } else {
        // Trusted device login success!
        if (onSuccessLogin) onSuccessLogin();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Invalid username or password.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Registration Submit -> Trigger Phone OTP
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password || !phoneNumber.trim()) return;

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (formattedPhone.length < 9) {
      setError("Please enter a valid international phone number with country code (e.g. +92 300 1234567).");
      return;
    }

    setIsLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      // Step A: Check server-side 24-hour rate limit & uniqueness
      const checkRes = await checkOtpRateLimit({
        phone: formattedPhone,
        username: username.trim(),
        attemptType: "registration",
      });

      // Step B: Dispatch SMS OTP via Firebase Phone Auth Free Tier
      const sendResult = await sendFirebasePhoneOtp(formattedPhone, "recaptcha-container");
      
      setPhoneNumber(formattedPhone);
      setMaskedPhoneDisplay(formattedPhone);
      setOtpContext("registration");
      if (sendResult.message) {
        setInfoMessage(sendResult.message);
      }
      setView("otp_verify");
    } catch (err: any) {
      setError(err.message || "Failed to send verification code. Please check your phone number.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle OTP Code Verification & Final Account Creation / Device Trust
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Step A: Verify with Firebase Phone Auth
      await verifyFirebasePhoneOtp(otpCode.trim());

      // Step B: Register or Trust Device on Server
      if (otpContext === "registration") {
        await registerUser({
          username: username.trim(),
          password,
          phone: phoneNumber,
        });
      } else {
        await verifyNewDeviceUser({
          username: username.trim(),
          password,
          phone: phoneNumber,
        });
      }

      if (onSuccessLogin) onSuccessLogin();
      onClose();
    } catch (err: any) {
      setError(err.message || "Invalid or expired verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setIsLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      // Check server rate limit
      await checkOtpRateLimit({
        phone: phoneNumber,
        username: username.trim(),
        attemptType: otpContext,
      });

      const sendResult = await sendFirebasePhoneOtp(phoneNumber, "recaptcha-container");
      if (sendResult.message) {
        setInfoMessage(sendResult.message);
      }
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to resend verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Handle Guest Exploration
  const handleGuestContinue = () => {
    continueAsGuest();
    if (onSuccessLogin) onSuccessLogin();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container" />

      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ========================================================================= */}
        {/* VIEW 1: SIGN IN (Username & Password only) */}
        {/* ========================================================================= */}
        {view === "login" && (
          <>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto shadow-sm">
                <LogIn className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Sign in to Project Atlas
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Enter your credentials to resume your academic research and expert tutoring sessions.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs font-medium text-center flex items-center justify-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    autoFocus
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Guest Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGuestContinue}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Continue as Guest (5 queries / day)</span>
              </button>
            </div>

            <div className="text-center text-xs pt-1">
              <span className="text-slate-500 dark:text-slate-400">Don't have an account? </span>
              <button
                onClick={() => {
                  setError(null);
                  setInfoMessage(null);
                  setView("register");
                }}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Register with Phone
              </button>
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: REGISTRATION (Username, Password, Phone Number) */}
        {/* ========================================================================= */}
        {view === "register" && (
          <>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto shadow-sm">
                <Smartphone className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Create your account
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Provide your username, password, and mobile number to receive a secure verification code.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs font-medium text-center flex items-center justify-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. quantum_scholar"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="At least 6 characters"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Phone Number (with Country Code)
                  </label>
                  <span className="text-[10px] text-slate-400">Unique identifier</span>
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    placeholder="+92 300 1234567 / +1 415 555 2671"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Standard free-tier SMS OTP verification. Max 3 attempts per 24 hours.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending verification SMS...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-1">
              <button
                type="button"
                onClick={handleGuestContinue}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Continue as Guest (5 queries / day)</span>
              </button>
            </div>

            <div className="text-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">Already registered? </span>
              <button
                onClick={() => {
                  setError(null);
                  setInfoMessage(null);
                  setView("login");
                }}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Sign In
              </button>
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: OTP VERIFICATION */}
        {/* ========================================================================= */}
        {view === "otp_verify" && (
          <>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-sm">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {otpContext === "new_device" ? "Verify New Device" : "Enter Verification Code"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {otpContext === "new_device" ? (
                  <span>A new device was detected. Enter the 6-digit code sent to <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{maskedPhoneDisplay}</strong> to authorize this device permanently.</span>
                ) : (
                  <span>We sent a 6-digit verification code to <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{maskedPhoneDisplay}</strong>.</span>
                )}
              </p>
            </div>

            {infoMessage && (
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-medium text-center">
                {infoMessage}
              </div>
            )}

            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs font-medium text-center flex items-center justify-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 text-center">
                  6-Digit SMS Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full py-3 px-4 text-center tracking-[0.4em] font-mono text-lg font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otpCode.length < 6}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {otpContext === "new_device" ? "Verify & Trust Device" : "Verify & Create Account"}
                    </span>
                  </>
                )}
              </button>
            </form>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isLoading}
                className="w-full py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1.5 disabled:text-slate-400"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>
                  {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : "Resend Verification Code"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setInfoMessage(null);
                  setOtpCode("");
                  setView("register");
                }}
                className="w-full py-1 text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                Change details / Go back
              </button>
            </div>
          </>
        )}

        {/* Benefits Footnote */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>90-day persistent session · Never log in again unless switching devices</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Encrypted credentials & secure device authorization</span>
          </div>
        </div>
      </div>
    </div>
  );
};
