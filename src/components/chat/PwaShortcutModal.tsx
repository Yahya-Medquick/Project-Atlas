import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Laptop,
  Copy,
  Check,
  Download,
  Share2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { ExpertPersona } from '../../data/experts';

interface PwaShortcutModalProps {
  persona: ExpertPersona | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PwaShortcutModal: React.FC<PwaShortcutModalProps> = ({
  persona,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !persona) return null;

  const directUrl = `${window.location.origin}/?persona=${persona.id}&mode=concept`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs"
              style={{ backgroundColor: persona.avatar_color }}
            >
              {persona.initials}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Add {persona.name} to Desktop
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                1-tap direct launch shortcut
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs text-slate-700 dark:text-slate-300">
          {/* Direct URL Box */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Direct Persona Launch Link
            </label>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <input
                type="text"
                readOnly
                value={directUrl}
                className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none select-all truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Device Instructions */}
          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Smartphone className="w-4 h-4 text-indigo-500" />
                <span>Mobile (iOS Safari & Android Chrome)</span>
              </div>
              <ol className="list-decimal list-inside text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pl-1">
                <li>Tap the <strong>Share</strong> or <strong>Menu (⋮)</strong> icon in your browser.</li>
                <li>Select <strong>&quot;Add to Home Screen&quot;</strong>.</li>
                <li>Tap <strong>&quot;Add&quot;</strong> to launch {persona.name} anytime as a native app icon.</li>
              </ol>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Laptop className="w-4 h-4 text-emerald-500" />
                <span>Desktop (Chrome, Edge, Brave)</span>
              </div>
              <ol className="list-decimal list-inside text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pl-1">
                <li>Click the <strong>Install / App icon (⊕)</strong> in the URL address bar.</li>
                <li>Or drag the URL lock icon directly onto your desktop or taskbar dock.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
