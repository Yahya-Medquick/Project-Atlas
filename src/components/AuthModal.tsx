import React, { useState } from "react";
import { X, LogIn, ShieldCheck, Sparkles, CheckCircle2, Mail, User, Lock, ArrowRight, RotateCcw } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useUser } from "../context/UserContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin?: () => void;
}

type ViewState = "signin" | "signup" | "checkemail";

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
}) => {
  const { loginWithGoogle, registerUser, loginWithEmail } = useUser();
  const [view, setView] = useState<ViewState>("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sign In inputs
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up inputs
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");

  // Google Simulated Login inputs
  const [simulatedEmail, setSimulatedEmail] = useState("");
  const [simulatedName, setSimulatedName] = useState("");

  if (!isOpen) return null;

  const handleCredentialResponse = async (credentialResponse: any) => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle({ credential: credentialResponse.credential });
      if (onSuccessLogin) onSuccessLogin();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to log in with Google ID token.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulatedGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatedEmail) return;
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle({
        email: simulatedEmail,
        name: simulatedName || simulatedEmail.split("@")[0],
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(simulatedEmail)}`,
      });
      if (onSuccessLogin) onSuccessLogin();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google simulation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) return;
    setIsLoading(true);
    setError(null);
    try {
      await loginWithEmail(signInEmail, signInPassword);
      if (onSuccessLogin) onSuccessLogin();
      onClose();
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName || !signUpEmail) return;
    setIsLoading(true);
    setError(null);
    try {
      await registerUser(signUpEmail, signUpName);
      setView("checkemail");
    } catch (err: any) {
      setError(err.message || "Failed to sign up.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await registerUser(signUpEmail, signUpName);
    } catch (err: any) {
      setError(err.message || "Failed to resend verification email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {view === "signin" && (
          <>
            {/* Modal Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
                <LogIn className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Sign in to Bifrost AI
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Unlock Research Papers, Software Repositories, custom search history, and daily tab limits.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs font-medium text-center">
                {error}
              </div>
            )}

            {/* Email / Password Sign In Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="name@example.com"
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
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? "Signing in..." : "Sign In with Email"}</span>
              </button>
            </form>

            <div className="text-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">Don't have an account? </span>
              <button
                onClick={() => {
                  setError(null);
                  setView("signup");
                }}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Sign Up
              </button>
            </div>

            <div className="relative flex items-center justify-center my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <span className="relative px-3 bg-white dark:bg-slate-900 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Or Google Sign-In
              </span>
            </div>

            {/* Google OAuth Section */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleCredentialResponse}
                  onError={() => setError("Google OAuth login prompt closed or unconfigured.")}
                  useOneTap={false}
                  theme="outline"
                  size="large"
                  shape="pill"
                />
              </div>

              <details className="text-center">
                <summary className="text-[11px] text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-200 select-none">
                  Instant Simulated Google Login
                </summary>
                <form onSubmit={handleSimulatedGoogleLogin} className="space-y-3 mt-3 text-left" autoComplete="off">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Simulated Google Email
                    </label>
                    <input
                      type="email"
                      value={simulatedEmail}
                      onChange={(e) => setSimulatedEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="your.email@gmail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Simulated Full Name
                    </label>
                    <input
                      type="text"
                      value={simulatedName}
                      onChange={(e) => setSimulatedName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Your Name"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Instant Continue (Simulated)</span>
                  </button>
                </form>
              </details>
            </div>
          </>
        )}

        {view === "signup" && (
          <>
            {/* Modal Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Create your account
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Join Bifrost AI to gain research capabilities and custom workspaces.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs font-medium text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailSignUp} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Your Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? "Signing up..." : "Sign Up"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">Already have an account? </span>
              <button
                onClick={() => {
                  setError(null);
                  setView("signin");
                }}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Sign In
              </button>
            </div>
          </>
        )}

        {view === "checkemail" && (
          <>
            {/* Modal Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto animate-bounce">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Check your email
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 text-center space-y-3">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                We sent a verification link to <strong className="text-indigo-600 dark:text-indigo-400">{signUpEmail}</strong>. Click it to set your password.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs font-medium text-center">
                {error}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                onClick={handleResendVerification}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isLoading ? "Resending..." : "Resend Verification Email"}</span>
              </button>

              <button
                onClick={() => {
                  setError(null);
                  setView("signin");
                }}
                className="w-full py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-medium hover:underline block text-center"
              >
                Back to Sign In
              </button>
            </div>
          </>
        )}

        {/* Benefits List */}
        {view !== "checkemail" && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Full access to Research Papers & Software Repositories</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Persistent search history with pinning & starring</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>5 free searches per tab daily with automatic UTC reset</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
