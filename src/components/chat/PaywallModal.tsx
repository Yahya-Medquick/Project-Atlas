import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Award,
  BookOpen,
  Code2,
  Atom,
  Clock,
} from 'lucide-react';
import { useUser } from '../../context/UserContext';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  queryUsage: {
    count: number;
    limit: number;
    remaining: number;
    tier: string;
    isLoggedIn: boolean;
  };
  onOpenLogin: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  queryUsage,
  onOpenLogin,
}) => {
  const { user, isLoggedIn } = useUser();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSimulatedUpgrade = async () => {
    setIsUpgrading(true);
    await new Promise((r) => setTimeout(r, 600));

    // Save upgraded status locally
    try {
      localStorage.setItem('bifrost_user_tier', 'paid');
    } catch (e) {}

    setIsUpgrading(false);
    onClose();
    window.location.reload();
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (waitlistEmail.trim()) {
      setWaitlistSuccess(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="relative p-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-indigo-100 border border-white/20 mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Query Limit Reached</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Unlock Unlimited Bifrost AI Pro
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1.5 max-w-md leading-relaxed">
            Accelerate your research, master competitive exams, and consult world-leading domain specialists with zero daily limits.
          </p>
        </div>

        {/* Pricing & Value Details */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          {/* Plan Switcher */}
          <div className="flex items-center justify-center">
            <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1 text-xs">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Monthly ($12/mo)
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  billingCycle === 'yearly'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Yearly ($99/yr)</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold">
                  Save 31%
                </span>
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Unlimited Queries</h4>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  No 5/day limit. Ask comprehensive multi-turn academic questions.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">All 8+ Personas</h4>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  Full access to global & regional expert specialists across all domains.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Live Research Mode</h4>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  Automated arXiv, OpenAlex, and GitHub literature extraction.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">LaTeX & Code Export</h4>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  1-click export of mathematical proofs and formatted study notes.
                </p>
              </div>
            </div>
          </div>

          {/* Upgrade CTA */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleSimulatedUpgrade}
              disabled={isUpgrading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
            >
              {isUpgrading ? (
                <span>Activating Pro Access...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Activate Pro Instant Access ({billingCycle === 'monthly' ? '$12/month' : '$99/year'})</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>

            {!isLoggedIn && (
              <p className="text-center text-xs text-slate-500">
                Already registered?{' '}
                <button
                  onClick={() => {
                    onClose();
                    onOpenLogin();
                  }}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Sign in with account
                </button>
              </p>
            )}
          </div>

          {/* Waitlist / Promo Box */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Student / Institutional Discount or Waitlist</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-2">
              Are you a student or academic researcher? Enter your email to apply for our free tier expansion grants.
            </p>
            {waitlistSuccess ? (
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Thank you! We have added you to our priority academic grant review.</span>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  placeholder="Enter university / work email..."
                  required
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity"
                >
                  Apply
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
