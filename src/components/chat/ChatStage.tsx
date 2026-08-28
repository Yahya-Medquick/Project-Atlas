import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  Bookmark,
  FileText,
  PanelLeft,
  PanelRight,
  GraduationCap,
  Lightbulb,
  BookOpen,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ExternalLink,
  Edit2,
  Share2,
  Zap,
  ArrowRight,
  Code2,
  Atom,
  Eye,
  EyeOff,
  Star,
  CheckCircle2,
  Compass,
  Network,
  Layers,
  Play,
  Newspaper,
} from 'lucide-react';
import { ChatSession, ChatMessage, ChatMode, ConceptSpecs, ExamSpecs, ResearchSpecs } from '../../types/chat';
import { ExpertPersona, EXPERTS, EXPERTS_PK } from '../../data/experts';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { SpecificationsAccordion } from './SpecificationsAccordion';
import { MCQCard } from '../cards/MCQCard';
import { VideoCard } from '../cards/VideoCard';
import { NewsCard } from '../cards/NewsCard';
import { MultiLevelDefinitionCard } from '../MultiLevelDefinitionCard';

// Helper component for YouTube Video Guides (backend YouTube Data API integration)
const ExploreVideosSection: React.FC<{ topic: string }> = ({ topic }) => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch(`/api/category/videos?q=${encodeURIComponent(topic)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data && Array.isArray(data.items)) {
          setVideos(data.items);
        }
      })
      .catch((err) => console.error("Error fetching YouTube videos:", err))
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [topic]);

  if (loading) {
    return (
      <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
        <span>Loading YouTube video guides for {topic}...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
        <span className="flex items-center gap-1.5">
          <Play className="w-4 h-4 text-rose-500 fill-rose-500" />
          YouTube Video Guides ({topic})
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {videos.slice(0, 4).map((video: any, idx: number) => (
          <VideoCard key={video.id || idx} video={video} />
        ))}
      </div>
    </div>
  );
};

// Helper component for Recent News (backend News API integration)
const ExploreNewsSection: React.FC<{ topic: string }> = ({ topic }) => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch(`/api/category/news?q=${encodeURIComponent(topic)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data && Array.isArray(data.items)) {
          setNews(data.items);
        }
      })
      .catch((err) => console.error("Error fetching news:", err))
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [topic]);

  if (loading) {
    return (
      <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping" />
        <span>Fetching recent news about {topic}...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
        <span className="flex items-center gap-1.5">
          <Newspaper className="w-4 h-4 text-blue-500" />
          Recent News ({topic})
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {news.slice(0, 4).map((article: any, idx: number) => (
          <NewsCard key={article.id || idx} article={article} />
        ))}
      </div>
    </div>
  );
};

interface ChatStageProps {
  session: ChatSession | null;
  activePersona: ExpertPersona;
  variant: 'global' | 'pk';
  onSendMessage: (content: string, modeOverride?: ChatMode) => Promise<void>;
  isLoading: boolean;
  onToggleLeftPanel: () => void;
  isLeftPanelOpen: boolean;
  onToggleRightPanel: () => void;
  isRightPanelOpen: boolean;
  onUpdateSessionMeta: (sessionId: string, updates: Partial<Pick<ChatSession, 'mode' | 'personaId' | 'variant' | 'specs' | 'title'>>) => void;
  onSaveToNotes: (content: string, title?: string) => void;
  onSaveBookmark: (title: string, category: any, url?: string, description?: string) => void;
  onOpenPaywall: () => void;
  onOpenKnowledgeGraph?: () => void;
  queryUsage: {
    count: number;
    limit: number;
    remaining: number;
    tier: string;
    isLoggedIn: boolean;
  };
}

export const ChatStage: React.FC<ChatStageProps> = ({
  session,
  activePersona,
  variant,
  onSendMessage,
  isLoading,
  onToggleLeftPanel,
  isLeftPanelOpen,
  onToggleRightPanel,
  isRightPanelOpen,
  onUpdateSessionMeta,
  onSaveToNotes,
  onSaveBookmark,
  onOpenPaywall,
  onOpenKnowledgeGraph,
  queryUsage,
}) => {
  const [inputText, setInputText] = useState('');
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [showMCQCard, setShowMCQCard] = useState<boolean>(false);
  const [showDefinitionCard, setShowDefinitionCard] = useState<boolean>(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [savedNotesMsgId, setSavedNotesMsgId] = useState<string | null>(null);
  const [savedBookmarkMsgId, setSavedBookmarkMsgId] = useState<string | null>(null);
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [activeLevelTabs, setActiveLevelTabs] = useState<Record<string, 'eli5' | 'highSchool' | 'undergrad' | 'phd'>>({});
  const [activeExploreMsgId, setActiveExploreMsgId] = useState<string | null>(null);
  const [activeExploreTab, setActiveExploreTab] = useState<'videos' | 'news' | 'mcqs' | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestTurnRef = useRef<HTMLDivElement>(null);
  const prevMsgLenRef = useRef<number>(session?.messages.length || 0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeMode: ChatMode = session?.mode || 'concept';

  // Auto-scroll to start of response when user asks a query
  useEffect(() => {
    const currentLen = session?.messages.length || 0;
    if (currentLen > prevMsgLenRef.current) {
      setTimeout(() => {
        latestTurnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
    prevMsgLenRef.current = currentLen;
  }, [session?.messages.length, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const msg = inputText.trim();
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await onSendMessage(msg);
  };

  const handleCopyMessage = (msgId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleSaveNote = (msgId: string, content: string) => {
    const title = session?.title ? `${activePersona.name} on ${session.title}` : `Note from ${activePersona.name}`;
    onSaveToNotes(content, title);
    setSavedNotesMsgId(msgId);
    setTimeout(() => setSavedNotesMsgId(null), 2500);
  };

  const handleSaveBookmarkAction = (msgId: string, content: string) => {
    const title = session?.title || `${activePersona.name} Insight`;
    onSaveBookmark(title, activeMode === 'research' ? 'research' : 'overview', window.location.href, content.substring(0, 160));
    setSavedBookmarkMsgId(msgId);
    setTimeout(() => setSavedBookmarkMsgId(null), 2500);
  };

  const handleModeChange = (mode: ChatMode) => {
    if (session) {
      onUpdateSessionMeta(session.id, { mode });
    }
  };

  const handleSpecsChange = (newSpecs: any) => {
    if (session) {
      onUpdateSessionMeta(session.id, { specs: newSpecs });
    }
  };

  const toggleSolutionReveal = (msgId: string) => {
    setRevealedSolutions((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const setLevelTab = (msgId: string, lvl: 'eli5' | 'highSchool' | 'undergrad' | 'phd') => {
    setActiveLevelTabs((prev) => ({ ...prev, [msgId]: lvl }));
  };

  const handleToggleExploreTab = (msgId: string, tab: 'videos' | 'news' | 'mcqs') => {
    if (activeExploreMsgId === msgId && activeExploreTab === tab) {
      setActiveExploreMsgId(null);
      setActiveExploreTab(null);
    } else {
      setActiveExploreMsgId(msgId);
      setActiveExploreTab(tab);
    }
  };

  const currentTopic = session?.title && session.title !== 'New Consultation' ? session.title : 'this topic';

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-slate-950 overflow-hidden relative">
      {/* 1. TOP HEADER BAR */}
      <header className="h-14 px-3 sm:px-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-between shrink-0 z-10 gap-2">
        {/* Left Section: Sidebar Toggle & Active Persona Badge */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {!isLeftPanelOpen && (
            <button
              onClick={onToggleLeftPanel}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Open Chat History"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}

          {/* Active Persona Pill */}
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-2xs"
              style={{ backgroundColor: activePersona.avatar_color }}
            >
              {activePersona.initials}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {activePersona.name}
                </span>
                <span
                  className="hidden md:inline-block text-[9px] font-bold px-1.5 py-0.2 rounded border"
                  style={{
                    color: activePersona.avatar_color,
                    borderColor: `${activePersona.avatar_color}40`,
                    backgroundColor: `${activePersona.avatar_color}10`,
                  }}
                >
                  {activePersona.badge}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 truncate">
                {activePersona.role}
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right Section: Mode Tabs & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => handleModeChange('concept')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeMode === 'concept'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Concept</span>
            </button>

            <button
              onClick={() => handleModeChange('exam')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeMode === 'exam'
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-300 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exam</span>
            </button>

            <button
              onClick={() => handleModeChange('research')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeMode === 'research'
                  ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-300 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Research</span>
            </button>
          </div>

          {/* Quick Tools: MCQ Quiz, Multi-Level Definition, Knowledge Graph */}
          <div className="hidden lg:flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
            <button
              onClick={() => setShowMCQCard(!showMCQCard)}
              className={`p-1.5 px-2 rounded-lg border transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer ${
                showMCQCard
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              title="Toggle Interactive MCQ Quiz"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px]">MCQs</span>
            </button>

            <button
              onClick={() => setShowDefinitionCard(!showDefinitionCard)}
              className={`p-1.5 px-2 rounded-lg border transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer ${
                showDefinitionCard
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              title="Toggle Multi-Level Rigorous Definitions"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[11px]">Rigor</span>
            </button>

            {onOpenKnowledgeGraph && (
              <button
                onClick={onOpenKnowledgeGraph}
                className="p-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                title="Open Interactive Knowledge Graph"
              >
                <Network className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-[11px]">Graph</span>
              </button>
            )}
          </div>

          {/* Specifications Accordion Button */}
          <button
            onClick={() => setIsSpecsOpen(!isSpecsOpen)}
            className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer ${
              isSpecsOpen
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Toggle Mode Filters & Specifications"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Filters</span>
          </button>

          {/* Query Usage Pill / Upgrade CTA */}
          <button
            onClick={onOpenPaywall}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              queryUsage.tier === 'paid'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : queryUsage.remaining <= 1
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-500" />
            <span className="hidden sm:inline">
              {queryUsage.tier === 'paid' ? 'Pro' : `${queryUsage.remaining} Left`}
            </span>
          </button>

          {!isRightPanelOpen && (
            <button
              onClick={onToggleRightPanel}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Open Personas"
            >
              <PanelRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* 2. SPECIFICATIONS ACCORDION DRAWER */}
      <SpecificationsAccordion
        mode={activeMode}
        specs={session?.specs || {}}
        onChangeSpecs={handleSpecsChange}
        isOpen={isSpecsOpen}
        onToggle={() => setIsSpecsOpen(!isSpecsOpen)}
      />

      {/* 3. MESSAGES STREAM */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Toggleable MCQ Quiz Card */}
        {showMCQCard && (
          <div className="max-w-3xl mx-auto w-full">
            <MCQCard
              topic={session?.title || 'Quantum Mechanics'}
              onSaveToNotes={onSaveToNotes}
              onClose={() => setShowMCQCard(false)}
            />
          </div>
        )}

        {/* Toggleable Multi-Level Definition Card */}
        {showDefinitionCard && (
          <div className="max-w-3xl mx-auto w-full relative">
            <button
              onClick={() => setShowDefinitionCard(false)}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close Definition Breakdown"
            >
              ✕
            </button>
            <MultiLevelDefinitionCard topic={session?.title || 'Quantum Mechanics'} />
          </div>
        )}

        {(!session || session.messages.length <= 1) && (
          <div className="max-w-2xl mx-auto py-6 space-y-6 animate-in fade-in duration-300">
            {/* Persona Hero Greeting */}
            <div className="text-center space-y-3">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black mx-auto shadow-md"
                style={{ backgroundColor: activePersona.avatar_color }}
              >
                {activePersona.initials}
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Consult {activePersona.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
                {activePersona.description}
              </p>
            </div>

            {/* Mode Guide Pill */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {activeMode === 'concept' && <Lightbulb className="w-4 h-4 text-indigo-500" />}
                {activeMode === 'exam' && <GraduationCap className="w-4 h-4 text-amber-500" />}
                {activeMode === 'research' && <BookOpen className="w-4 h-4 text-cyan-500" />}
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide text-[10px]">
                  Current Mode: {activeMode}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                {activeMode === 'concept'
                  ? 'Deep analogies & LaTeX derivations'
                  : activeMode === 'exam'
                  ? 'Past papers, grading & trap analysis'
                  : 'arXiv papers, OpenAlex & GitHub tools'}
              </span>
            </div>
          </div>
        )}

        {/* Render Messages */}
        {session?.messages.map((msg, idx) => {
          const isAssistant = msg.role === 'assistant';
          const isLatestTurnStart = idx === Math.max(0, (session?.messages.length || 0) - (isLoading ? 1 : 2));
          const msgPersona = isAssistant
            ? (variant === 'pk' ? EXPERTS_PK : EXPERTS)[msg.personaId || activePersona.id] || activePersona
            : null;

          return (
            <div
              key={msg.id || idx}
              ref={isLatestTurnStart ? latestTurnRef : null}
              className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'} max-w-3xl mx-auto w-full`}
            >
              {/* Message Header */}
              <div className="flex items-center gap-2 mb-1.5 px-1 text-[11px] text-slate-400">
                {isAssistant && msgPersona && (
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <div
                      className="w-4 h-4 rounded-md flex items-center justify-center text-white text-[8px] font-bold"
                      style={{ backgroundColor: msgPersona.avatar_color }}
                    >
                      {msgPersona.initials}
                    </div>
                    <span>{msgPersona.name}</span>
                    {msg.mode && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
                        {msg.mode}
                      </span>
                    )}
                  </div>
                )}
                {!isAssistant && <span className="font-semibold text-slate-600 dark:text-slate-300">You</span>}
                <span>·</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div
                className={`relative rounded-2xl p-4 sm:p-5 text-sm transition-all shadow-xs ${
                  isAssistant
                    ? 'w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                    : 'bg-indigo-600 text-white font-medium max-w-[85%] rounded-tr-xs'
                }`}
              >
                {/* Content */}
                {isAssistant ? (
                  <div className="space-y-4">
                    <MarkdownRenderer content={msg.content} />

                    {/* Interactive Multi-Level Explanation Pills if available */}
                    {msg.metadata?.multiLevel && (
                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Rigor Level Switcher
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(['eli5', 'highSchool', 'undergrad', 'phd'] as const).map((lvl) => (
                            <button
                              key={lvl}
                              onClick={() => setLevelTab(msg.id, lvl)}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-colors ${
                                (activeLevelTabs[msg.id] || 'undergrad') === lvl
                                  ? 'bg-indigo-600 text-white shadow-2xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                              }`}
                            >
                              {lvl === 'eli5' ? 'ELI5' : lvl === 'highSchool' ? 'High School' : lvl === 'undergrad' ? 'Undergraduate' : 'PhD / Rigorous'}
                            </button>
                          ))}
                        </div>
                        {msg.metadata.multiLevel[activeLevelTabs[msg.id] || 'undergrad'] && (
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                            <MarkdownRenderer content={msg.metadata.multiLevel[activeLevelTabs[msg.id] || 'undergrad']!} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Interactive Exam Question Reveal Box if available */}
                    {msg.metadata?.examQuestion && (
                      <div className="mt-4 p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800 dark:text-amber-300">
                            <GraduationCap className="w-4 h-4" />
                            <span>Exam Question Specification</span>
                          </div>
                          {msg.metadata.examQuestion.marks && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200">
                              {msg.metadata.examQuestion.marks} Marks
                            </span>
                          )}
                        </div>

                        {msg.metadata.examQuestion.question && (
                          <div className="font-semibold text-xs text-slate-900 dark:text-white">
                            {msg.metadata.examQuestion.question}
                          </div>
                        )}

                        {/* Reveal Solution Button */}
                        <div className="pt-2">
                          <button
                            onClick={() => toggleSolutionReveal(msg.id)}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            {revealedSolutions[msg.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span>{revealedSolutions[msg.id] ? 'Hide Full Derivation' : 'Reveal Step-by-Step Solution & Rubric'}</span>
                          </button>

                          {revealedSolutions[msg.id] && msg.metadata.examQuestion.solution && (
                            <div className="mt-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-amber-300/60 dark:border-amber-800 text-xs animate-in fade-in">
                              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase">
                                Model Answer & Derivation
                              </div>
                              <MarkdownRenderer content={msg.metadata.examQuestion.solution} />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Research Papers Cards if available */}
                    {msg.metadata?.papers && msg.metadata.papers.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Cited Literature & Papers
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.metadata.papers.map((paper, pIdx) => (
                            <div
                              key={pIdx}
                              className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                            >
                              <a
                                href={paper.url || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 flex items-start justify-between gap-1"
                              >
                                <span className="line-clamp-2">{paper.title}</span>
                                <ExternalLink className="w-3 h-3 shrink-0 text-slate-400" />
                              </a>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <span>{paper.year}</span>
                                {paper.citationCount !== undefined && (
                                  <span>· {paper.citationCount} Citations</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* EXPLORE MORE FOOTER CARDS AT THE END OF EVERY ASSISTANT MESSAGE */}
                    <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          <Compass className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Explore More</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Deepen your understanding</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {/* 1. Video Guide (YouTube Data API endpoint) */}
                        <button
                          onClick={() => handleToggleExploreTab(msg.id, 'videos')}
                          className={`p-3 rounded-xl border text-left transition-all group cursor-pointer space-y-1 ${
                            activeExploreMsgId === msg.id && activeExploreTab === 'videos'
                              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-400 flex items-center gap-1.5">
                              <Play className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                              Video Guides
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-rose-500" />
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            YouTube lectures & video guides
                          </p>
                        </button>

                        {/* 2. Recent News */}
                        <button
                          onClick={() => handleToggleExploreTab(msg.id, 'news')}
                          className={`p-3 rounded-xl border text-left transition-all group cursor-pointer space-y-1 ${
                            activeExploreMsgId === msg.id && activeExploreTab === 'news'
                              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center gap-1.5">
                              <Newspaper className="w-3.5 h-3.5 text-blue-500" />
                              Recent News
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-500" />
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            Latest research & news updates
                          </p>
                        </button>

                        {/* 3. Practice MCQs ("Test your grip on that topic") */}
                        <button
                          onClick={() => handleToggleExploreTab(msg.id, 'mcqs')}
                          className={`p-3 rounded-xl border text-left transition-all group cursor-pointer space-y-1 ${
                            activeExploreMsgId === msg.id && activeExploreTab === 'mcqs'
                              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center gap-1.5">
                              <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                              Test Your Grip
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-amber-500" />
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            Practice MCQs & interactive quiz
                          </p>
                        </button>
                      </div>

                      {/* Expanded Section Drawer for Active Explore Card */}
                      {activeExploreMsgId === msg.id && activeExploreTab && (
                        <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 relative animate-in fade-in duration-200">
                          <button
                            onClick={() => { setActiveExploreMsgId(null); setActiveExploreTab(null); }}
                            className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs font-bold"
                            title="Close drawer"
                          >
                            ✕
                          </button>

                          {activeExploreTab === 'videos' && (
                            <ExploreVideosSection topic={currentTopic} />
                          )}

                          {activeExploreTab === 'news' && (
                            <ExploreNewsSection topic={currentTopic} />
                          )}

                          {activeExploreTab === 'mcqs' && (
                            <MCQCard
                              topic={currentTopic}
                              onSaveToNotes={onSaveToNotes}
                              onClose={() => { setActiveExploreMsgId(null); setActiveExploreTab(null); }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}

                {/* Assistant Action Footer */}
                {isAssistant && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1 text-[11px]"
                        title="Copy to clipboard"
                      >
                        {copiedMsgId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleSaveNote(msg.id, msg.content)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 text-[11px]"
                        title="Save to compiled notes"
                      >
                        {savedNotesMsgId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-indigo-500" />
                            <span className="text-indigo-500 font-semibold">Saved Note</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-3 h-3" />
                            <span>Save Note</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleSaveBookmarkAction(msg.id, msg.content)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500 transition-colors flex items-center gap-1 text-[11px]"
                        title="Bookmark message"
                      >
                        {savedBookmarkMsgId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-amber-500" />
                            <span className="text-amber-500 font-semibold">Bookmarked</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3 h-3" />
                            <span>Bookmark</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onSendMessage(`Regenerate response with greater depth and detailed step-by-step mathematical rigor.`)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1 text-[11px]"
                        title="Regenerate response"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span className="hidden sm:inline">Regenerate</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2 max-w-3xl mx-auto w-full animate-in fade-in">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0 animate-pulse"
              style={{ backgroundColor: activePersona.avatar_color }}
            >
              {activePersona.initials}
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
              <span className="font-medium text-slate-600 dark:text-slate-300">
                {activePersona.name} is synthesizing {activeMode} response...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. CHAT INPUT STAGE */}
      <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shrink-0">
        <div className="max-w-3xl mx-auto space-y-2">
          {/* Main Input Box */}
          <form
            onSubmit={handleSubmit}
            className="relative flex items-end gap-2 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm focus-within:border-indigo-500 dark:focus-within:border-indigo-400 transition-colors"
          >
            {/* Auto-growing Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${activePersona.name} (${activeMode} mode)...`}
              className="flex-1 max-h-44 p-2 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 resize-none focus:outline-none leading-relaxed"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white disabled:opacity-30 disabled:pointer-events-none transition-all shrink-0 cursor-pointer shadow-xs"
              title="Send Message (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Bottom Notice / Disclaimer */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>
              Bifrost AI combines verified academic literature with persona modeling.
            </span>
            <span className="hidden sm:inline">Press Enter to send, Shift+Enter for newline</span>
          </div>
        </div>
      </div>
    </div>
  );
};
