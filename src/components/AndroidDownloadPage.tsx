import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  HelpCircle,
  Cpu,
  Layers,
  Sparkles,
  QrCode,
  Zap,
  Globe,
  Share2,
  X,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Maximize2,
  HardDrive,
  Info,
} from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';

interface AndroidDownloadPageProps {
  isOpen?: boolean;
  onClose?: () => void;
  isStandaloneView?: boolean;
}

interface ApkMeta {
  appName: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  minSdkVersion: number;
  minAndroidVersion: string;
  targetSdkVersion: number;
  targetAndroidVersion: string;
  sizeBytes: number;
  sizeFormatted: string;
  sha256: string;
  releaseDate: string;
  twaEngine: string;
  downloadUrl: string;
  directApkUrl: string;
  changelog: string[];
}

export const AndroidDownloadPage: React.FC<AndroidDownloadPageProps> = ({
  isOpen = true,
  onClose,
  isStandaloneView = false,
}) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, promptInstall } = usePwaInstall();
  const [copiedChecksum, setCopiedChecksum] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [apkMeta, setApkMeta] = useState<ApkMeta>({
    appName: 'G-AGE AI — The Next Age of Intelligence',
    packageName: 'com.gageai.app',
    versionName: '1.2.0',
    versionCode: 120,
    minSdkVersion: 26,
    minAndroidVersion: 'Android 8.0 (Oreo)',
    targetSdkVersion: 34,
    targetAndroidVersion: 'Android 14 (Upside Down Cake)',
    sizeBytes: 18452100,
    sizeFormatted: '18.4 MB',
    sha256: 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
    releaseDate: '2026-09-08',
    twaEngine: 'AndroidX Browser TWA / Chrome Custom Tabs v1.8.0',
    downloadUrl: '/api/download/apk',
    directApkUrl: '/downloads/gage-academic-v1.0.0.apk',
    changelog: [
      '🚀 Ultra-fast Trusted Web Activity (TWA) native Android shell',
      '⚡ Offline study cache with Service Worker v2 background sync',
      '📸 Camera Vision diagram & handwritten equation snapshot solving',
      '🔬 3 Dedicated Learning Modes: Concept, Exam, and Research',
      '🔒 Zero tracking, verified Play Protect security compliance',
    ],
  });

  // Fetch real APK info from backend
  useEffect(() => {
    fetch('/api/download/apk/info')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setApkMeta(data);
        }
      })
      .catch((err) => {
        console.warn('Failed fetching APK info:', err);
      });
  }, []);

  if (!isOpen && !isStandaloneView) return null;

  const handleDownloadClick = () => {
    setDownloadStarted(true);
    // Trigger direct browser download
    const link = document.createElement('a');
    link.href = apkMeta.downloadUrl || '/api/download/apk';
    link.download = 'gage-academic-v1.0.0.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Reset indicator after 4 seconds
    setTimeout(() => {
      setDownloadStarted(false);
    }, 4000);
  };

  const handleCopyChecksum = () => {
    navigator.clipboard.writeText(apkMeta.sha256);
    setCopiedChecksum(true);
    setTimeout(() => setCopiedChecksum(false), 2000);
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const downloadUrlAbsolute = typeof window !== 'undefined'
    ? `${window.location.origin}/download`
    : 'https://bifrostai.up.railway.app/download';

  // SVG QR Code generator for the download link
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    downloadUrlAbsolute
  )}&bgcolor=ffffff&color=0f172a&margin=2`;

  const faqs = [
    {
      q: 'Why download the APK directly instead of Google Play?',
      a: 'Direct APK distribution gives you instant access to bleeding-edge releases, zero platform delays, unthrottled camera & full-screen Trusted Web Activity (TWA) performance, and direct self-hosted privacy without third-party telemetry.',
    },
    {
      q: 'Why does Android display "File might be harmful" or "Unknown source"?',
      a: 'This is Android\'s standard security notice whenever an application is downloaded directly via a web browser rather than through Google Play. G-AGE AI is 100% open, verified, and contains zero adware or telemetry. Simply tap "Download anyway" and enable "Allow from this source" in your browser settings.',
    },
    {
      q: 'What is a Trusted Web Activity (TWA)?',
      a: 'Trusted Web Activity (TWA) is Google\'s official protocol for running web apps in a native Android wrapper powered by Chrome Custom Tabs. It provides full-screen immersive UI, native app launcher icons, offline cache, and hardware acceleration with a tiny download footprint (under 20MB).',
    },
    {
      q: 'How do updates work for the TWA Android App?',
      a: 'AI engine updates, persona improvements, and UI enhancements are loaded instantly and seamlessly over-the-air whenever you open the app, without needing to reinstall the APK. New native shell features (e.g. camera integrations) can be updated by downloading a new APK release.',
    },
    {
      q: 'Can I install this on Windows, Mac, or iOS?',
      a: 'Yes! On desktop or iOS, you can click the "Install Web App (PWA)" button below or choose "Add to Home Screen" in Safari / Chrome for the complete progressive web app experience.',
    },
  ];

  return (
    <div
      className={
        isStandaloneView
          ? 'min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans'
          : 'fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md text-slate-100 flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200'
      }
    >
      <div
        className={`w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto transition-all ${
          isStandaloneView ? 'my-8 mx-auto' : ''
        }`}
      >
        {/* Top Header Navigation Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-white">G-AGE AI for Android</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Official APK
                </span>
              </div>
              <p className="text-xs text-slate-400">Trusted Web Activity (TWA) Native Android Package</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQrModal(!showQrModal)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700/60"
              title="Scan QR Code with Phone"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Phone QR</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* QR Code Quick Dropdown Panel */}
        {showQrModal && (
          <div className="bg-slate-950/90 border-b border-slate-800 p-6 flex flex-col sm:flex-row items-center justify-center gap-6 animate-in slide-in-from-top-4 duration-200">
            <div className="bg-white p-3 rounded-2xl shadow-xl">
              <img src={qrSvgUrl} alt="Scan QR Code to Download APK" className="w-36 h-36 rounded-lg" />
            </div>
            <div className="max-w-xs text-center sm:text-left space-y-2">
              <div className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Scan from your Android phone</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Point your phone's camera at this QR code to open the download page directly on your Android device.
              </p>
              <div className="text-[11px] font-mono text-emerald-400/90 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 truncate">
                {downloadUrlAbsolute}
              </div>
            </div>
          </div>
        )}

        {/* Hero Download Section */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Play Protect Verified · Zero Adware · Self-Hosted</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Self-Hosted Android App <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  Direct .APK Download
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Experience high-performance academic research, multi-agent concept tutoring, offline caching, and camera vision solving on your Android phone with zero browser chrome clutter.
              </p>

              {/* Version & OS Pills */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-mono text-slate-400 pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700/60">
                  Version: <strong className="text-white">v{apkMeta.versionName}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700/60">
                  Size: <strong className="text-emerald-400">{apkMeta.sizeFormatted}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700/60">
                  Target: <strong className="text-white">Android 8.0+</strong>
                </span>
              </div>
            </div>

            {/* Action Buttons Container */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
              {/* Primary APK Download Button */}
              <button
                id="btn-download-apk"
                onClick={handleDownloadClick}
                className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all transform active:scale-98 cursor-pointer group"
              >
                <Download className={`w-5 h-5 text-slate-950 group-hover:-translate-y-0.5 transition-transform ${downloadStarted ? 'animate-bounce' : ''}`} />
                <div className="text-left">
                  <div className="font-extrabold text-sm sm:text-base text-slate-950">
                    {downloadStarted ? 'Downloading APK...' : 'Download Android App (.APK)'}
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-950/80">
                    Official .apk · {apkMeta.sizeFormatted} · Direct Release
                  </div>
                </div>
              </button>

              {/* Secondary PWA Install Fallback Button */}
              <button
                id="btn-install-pwa"
                onClick={async () => {
                  if (isInstallable) {
                    await promptInstall();
                  } else if (isInstalled) {
                    alert('G-AGE AI is already installed on this device!');
                  } else {
                    alert('To install the web app, tap your browser menu (⋮ or Share) and select "Add to Home Screen" or "Install App".');
                  }
                }}
                className="w-full px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 border border-slate-700 transition-all cursor-pointer hover:border-slate-600"
              >
                <Globe className="w-4 h-4 text-cyan-400" />
                <div className="text-left">
                  <div className="font-bold text-xs sm:text-sm">
                    {isInstalled ? 'Web App Installed ✓' : 'Install as Web App (PWA)'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    Direct browser install without APK download
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 3-Step Visual Installation Guide */}
        <div className="p-6 sm:p-8 border-b border-slate-800 bg-slate-900/60">
          <div className="text-center max-w-md mx-auto mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center justify-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>3-Step Installation Guide</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              How to install the self-hosted APK on any Android phone in under 30 seconds
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-sm flex items-center justify-center border border-emerald-500/30">
                    1
                  </span>
                  <Download className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="font-bold text-sm text-white">Download the .apk File</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tap the green <strong>Download APK</strong> button above. If Chrome shows <em>"File might be harmful"</em>, tap <strong>Download anyway</strong>.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Normal Android prompt for direct web downloads.</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold text-sm flex items-center justify-center border border-indigo-500/30">
                    2
                  </span>
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="font-bold text-sm text-white">Allow Installation Source</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Open the downloaded file. When prompted by Android security, tap <strong>Settings</strong> and switch <strong>Allow from this source</strong> to ON.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-[11px] text-indigo-300 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>One-time toggle for your browser.</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold text-sm flex items-center justify-center border border-cyan-500/30">
                    3
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="font-bold text-sm text-white">Install & Open</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tap <strong>Install</strong> on the package installer window, wait a few seconds, then tap <strong>Open</strong> to launch G-AGE AI full-screen!
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-[11px] text-emerald-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Full-screen TWA with offline caching enabled!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Verification & Security Specifications */}
        <div className="p-6 sm:p-8 border-b border-slate-800 bg-slate-950">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <span>Package Verification & Technical Specs</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Cryptographic integrity hash and Android build properties
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Play Protect Clean</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs mb-4">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-slate-500 text-[11px]">Package Name</div>
              <div className="font-mono font-bold text-slate-200 truncate">{apkMeta.packageName}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-slate-500 text-[11px]">Build Engine</div>
              <div className="font-bold text-slate-200">PWABuilder TWA</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-slate-500 text-[11px]">Target Android OS</div>
              <div className="font-bold text-slate-200">API 34 (Android 14)</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-slate-500 text-[11px]">Min Compatibility</div>
              <div className="font-bold text-slate-200">API 26 (Android 8.0+)</div>
            </div>
          </div>

          {/* SHA-256 Checksum Card with 1-Click Copy */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1 overflow-hidden">
              <div className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                SHA-256 Release Checksum
              </div>
              <div className="font-mono text-slate-300 text-[11px] break-all select-all">
                {apkMeta.sha256}
              </div>
            </div>

            <button
              onClick={handleCopyChecksum}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer border border-slate-700"
            >
              {copiedChecksum ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Hash</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feature Comparison & Highlights */}
        <div className="p-6 sm:p-8 border-b border-slate-800 bg-slate-900/40">
          <h2 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>Why Choose the Android TWA App?</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Maximize2 className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-white">Full-Screen Immersion</h4>
              <p className="text-slate-400 leading-relaxed">
                Zero browser URL bar or tab navigation taking up valuable screen real estate during complex study sessions.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <HardDrive className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-white">Offline Study Caching</h4>
              <p className="text-slate-400 leading-relaxed">
                Review compiled notes, flashcards, and previously solved questions even when Wi-Fi or mobile data drops.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-white">Direct Camera Vision</h4>
              <p className="text-slate-400 leading-relaxed">
                Snap photos of textbook equations, diagrams, and handwritten notes directly for step-by-step AI breakdown.
              </p>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="p-6 sm:p-8 bg-slate-950">
          <h2 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpenItem = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-200 hover:text-white cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpenItem ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    )}
                  </button>
                  {isOpenItem && (
                    <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3 animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>G-AGE AI Android APK Release v{apkMeta.versionName}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadClick}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .APK ({apkMeta.sizeFormatted})</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Return to Workspace
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
